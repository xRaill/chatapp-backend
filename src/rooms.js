module.exports = (io, socket, args, callback) => {

	let Users    = mod.model('user');
	let Access   = mod.model('access');
	let Rooms    = mod.model('room');
	let Messages = mod.model('messages'); 

	let userId = clientData[socket.id].userid;

	if(args.type == 'get') Access.findAll({ where: Object.assign(
		{userId: userId, status: 1},
		args.roomId ? {roomId: args.roomId} : ''
	)}).then(async access => {
		let results = [];

		for (let i = 0; i < access.length; i++) await Rooms.findOne({ where: {id: access[i].roomId} }).then(room => Messages.findOne({
			where: {roomId: room.id},
			order: [['createdAt', 'DESC']]
		}).then(async message => {
			let username;

			if(message) if(message.userId == userId) username = 'You';
			else await Users.findOne({ where: {id: message ? message.userId : 0} }).then(user => username = user.username);

			return results.push(Object.assign({
				id:   room.id,
				name: room.name,
			}, !args.roomId ? {lastMsg: message ? username + ': ' + message.message : false} : ''));
		}));

		if(args.roomId) callback(Object.assign(results[0], {
			success: true
		}));

		return callback({
			success: true,
			rooms:   results
		});
	});

	else if(args.type == 'read') Access.findOne({ where: {userId: userId, roomId: args.roomId, status: 1} }).then(access => {

		if(!args.roomId) return callback({
			success: false,
			error:  'roomId not given'
		});

		if(args.date) if(access.readAt > args.date) return callback({
			success: false,
			error:  'Date cannot be greater than previous date'
		});

		access.update({
			readAt: args.date || new Date()
		}).then(access => {
			return callback({
				success: true
			});
		});

	});

	else if(args.type == 'create') Users.findOne({ where: {id: userId} }).then(user => {
		Rooms.create({
			name:   args.name ? args.name : 'Unnamed Room',
			owner:  userId,
			status: 1 
		}).then(room => Access.create({
			userId: userId,
			roomId: room.id,
			status: 1
		}).then(access => {
			socket.join('room-' + room.id);

			io.to('room-' + room.id).emit('rooms-add', [room])

			return callback({
				success: true
			});
		}));
	});

	else if(args.type == 'remove') Users.findOne({ where: {id: userId} }).then(user => {

		Rooms.findOne({ where: {id: args.roomId, owner: userId} }).then(room => room.update({status: 9}).then(room => {
			let clients = io.sockets.clients('room-' + room.id)

			io.to('room-' + args.roomId).emit('rooms-remove', {
				id:   room.id,
				name: room.name
			});

			for (let i = 0; i < clients.length; i++) clients[i].leave('room-' + room.id);
		}));
	});

	else if(args.type == 'users-get') Access.findOne({ where: {roomId: args.roomId, userId: userId, status: 1} }).then(access => {

		if(!access) return callback({
			success: false,
			error:  'User has no access to room'
		});

		Access.findAll({ where: {roomId: args.roomId, status: 1} }).then(async access2 => {
			let results = [];
			let owner;

			await Rooms.findOne({ where: {id: args.roomId} }).then(room => owner = room.owner);

			for (let i = 0; i < access2.length; i++) await Users.findOne({ where: {id: access2[i].userId} }).then(user => results.push({
				id:       user.id,
				username: user.username,
				owner:    owner == user.id
			}));

			return callback({
				success: true,
				owner:   userId == owner,
				users:   results
			});
		});
	});

	else if(args.type == 'users-promote') Rooms.findOne({ where: {id: args.roomId, owner: userId} }).then(room => {

		Users.findOne({ where: {id: args.userId} }).then(user => {
			room.update({ owner: user.id }).then(room => {

				let socketId = Object.entries(clientData).findOne(a => a[1].userid == user.id);
				if(socketId) io.sockets.connected[socketId[0]].emit('rooms-promoted', {
					roomName: room.name
				});

				return callback({
					success: true
				});
			});
		});
	});
	
	else if(args.type == 'users-add') Rooms.findOne({ where: {id: args.roomId, owner: userId} }).then(async room => {
		let results = [];

		if(!Array.isArray(args.userId)) args.userId = [args.userId];

		for (let i = 0; i < args.userId.length; i++) await Access.create({
			userId: args.userId,
			roomId: room.id,
			status: 1
		}).then(access => Users.findOne({ where: {id: args.userId} }).then(user => {
			// Get socketid
			let socketId = Object.entries(clientData).findOne(a => a[1].userid == user.id);

			if(socketId) io.sockets.connected[socketId[0]].emit('rooms-add', [room]);
			if(socketId) io.sockets.connected[socketId[0]].join('room-' + room.id);

			results.push({
				id:       user.id,
				username: user.username
			});
		}));

		return callback({
			success: true
		})
	});

	else if(args.type == 'users-remove') Rooms.findOne({ where: {id: args.roomId, owner: userId} }).then(async room => {
		
		if(!args.userId) return callback({
			success: false,
			error:  'No userId given'
		});

		if(!room) return callback({
			success: false,
			error:  'User is not owner of room'
		});

		let results = [];

		if(!Array.isArray(args.userId)) args.userId = [args.userId];

		for (let i = 0; i < args.userId.length; i++) await Access.findOne({
			where: {roomId: room.id, userId: args.userId[i], status: 1}
		}).then(access => access.update({status: 9}).then(access2 => {
			let socketId = Object.entries(clientData).findOne(a => a[1].userid == access.userId);
	
			if(socketId) io.sockets.connected[socketId[0]].leave('room-' + access.roomId);
			if(socketId) io.sockets.connected[socketId[0]].emit('rooms-remove', [room]);

			results.push(access2.userId);
		}));

		return callback({
			success: true
		});
	});

	else if(args.type == 'users-leave') Access.findOne({ where: {roomId: args.roomId, userId: userId} }).then(access => {

		if(!access) return callback({
			success: false,
			error:  'User has no access to room'
		});

		Rooms.findOne({ where: {id: access.roomId, owner: userId} }).then(room => {

			if(room) return callback({
				success: false,
				error:  'Owner can\'t leave own room'
			});

			access.update({ status: 9 }).then(access2 => {
				Rooms.findOne({ where: {id: args.roomId} }).then(room => socket.emit('rooms-remove', [room]));
				socket.leave('room-' + args.roomId)

				return callback({
					success: true,
				});
			});
		});
	});
}