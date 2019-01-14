module.exports = (io, socket, args, callback) => {

	let Users  = mod.model('user');
	let Access = mod.model('access');
	let Rooms  = mod.model('room');


	let userId = clientData[socket.id].userid;

	if(args.type == 'get') Access.findAll({ where: {userId: userId, status: 1}}).then(async access => {
		let results = [];

		for (let i = 0; i < access.length; i++) await Rooms.find({ where: {id: access[i].roomId} }).then(room => results.push(room));

		return callback({
			success: true,
			rooms:   results
		});
	});

	else if(args.type == 'create') Users.find({ where: {id: userId} }).then(user => {
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

	else if(args.type == 'remove') Users.find({ where: {id: userId} }).then(user => {

		Rooms.find({ where: {id: args.roomId, owner: userId} }).then(room => room.update({status: 9}).then(room => {
			let clients = io.sockets.clients('room-' + room.id)

			io.to('room-' + args.roomId).emit('rooms-remove', {
				id:   room.id,
				name: room.name
			});

			for (let i = 0; i < clients.length; i++) clients[i].leave('room-' + room.id);
		}));
	});

	else if(args.type == 'users-get') Access.find({ where: {roomId: args.roomId, userId: userId, status: 1} }).then(access => {

		if(!access) return callback({
			success: false,
			error:  'User has no access to room'
		});

		Access.findAll({ where: {roomId: args.roomId, status: 1} }).then(async access2 => {
			let results = [];
			let owner;

			await Rooms.find({ where: {id: args.roomId} }).then(room => owner = room.owner);

			for (let i = 0; i < access2.length; i++) await Users.find({ where: {id: access2[i].userId} }).then(user => results.push({
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

	else if(args.type == 'users-promote') Rooms.find({ where: {id: args.roomId, owner: userId} }).then(room => {

		Users.find({ where: {id: args.userId} }).then(user => {
			room.update({ owner: user.id }).then(room => {

				let socketId = Object.entries(clientData).find(a => a[1].userid == user.id);
		
				if(socketId) io.sockets.connected[socketId].socket.emit('rooms-promoted', {
					roomName: room.name
				});

				return callback({
					success: true
				});
			});
		});
	});
	
	else if(args.type == 'users-add') Rooms.find({ where: {id: args.roomId, owner: userId} }).then(async room => {
		let results = [];

		if(!Array.isArray(args.userId)) args.userId = [args.userId];

		for (let i = 0; i < args.userId.length; i++) await Access.create({
			userId: args.userId,
			roomId: room.id,
			status: 1
		}).then(access => Users.find({ where: {id: args.userId} }).then(user => {
			// Get socketid
			let socketId = Object.entries(clientData).find(a => a[1].userid == user.id);

			if(socketId) io.sockets.connected[socketId].socket.emit('rooms-add', [room]);
			if(socketId) io.sockets.connected[socketId].socket.join('room-' + room.id);

			results.push({
				id:       user.id,
				username: user.username
			});
		}));

		return callback({
			success: true
		})
	});

	else if(args.type == 'users-remove') Rooms.find({ where: {id: args.roomId, owner: userId} }).then(async room => {
		let results = [];

		if(!Array.isArray(args.userId)) args.userId = [args.userId];

		for (let i = 0; i < args.userId.length; i++) await Access.find(
			{where: {roomId: args.roomId, userId: args.userId[i]}
		}).then(access => access.update({status: 9}).then(access2 => {
			let socketId = Object.entries(clientData).find(a => a[1].userid == access.userId);
	
			if(socketId) io.sockets.connected[socketId].socket.leave('room-' + access.roomId);
			if(socketId) io.sockets.connected[socketId].socket.emit('rooms-remove', [room]);

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
				Rooms.find({ where: {id: args.roomId} }).then(room => socket.emit('rooms-remove', [room]));
				socket.leave('room-' + args.roomId)

				return callback({
					success: true,
				});
			});
		});
	});
}