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
			rooms: results
		});
	});

	else if(args.type == 'create') Users.find({ where: {id: userId} }).then(user => {
		Rooms.create({
			name: args.name ? args.name : 'Unnamed Room',
			owner: userId,
			status: 1 
		}).then(room => Access.create({
			userId: userId,
			roomId: room.id,
			status: 1
		}).then(access => callback({
			success: true,
			rooms: [room]
		})));
	});

	else if(args.type == 'remove') Users.find({ where: {id: userId}}).then(async user => {
		if(!Array.isArray(args.roomId)) args.roomId = [args.roomId];

		for (let i = 0; i < args.roomId.length; i++) await Rooms.find(
			{where: {id: args.roomId[i], owner: userId}
		}).then(room => room.update({status: 9}).then(room => io.to('room-' + args.roomId[i]).emit('rooms-remove', args.roomId[i])));
	});

	else if(args.type == 'users-get') Access.find({ where: {roomId: args.roomId, userId: userId, status: 1} }).then(access => {

		Access.findAll({ where: {roomId: args.roomId, status: 1} }).then(async access2 => {
			let results = [];
			let owner;

			await Rooms.find({ where: {id: args.roomId} }).then(room => owner = room.owner);

			for (let i = 0; i < access2.length; i++) await Users.find({ where: {id: access2[i].userId} }).then(user => results.push({
				id: user.id,
				username: user.username,
				owner: (owner == user.id)
			}));

			return callback({
				success: true,
				users: results
			});
		});
	});

	else if(args.type == 'users-promote') Rooms.find({ where: {id: args.roomId, owner: userId} }).then(room => {

		Users.find({ where: {id: args.userId} }).then(user => room.update({
			owner: user.id
		}).then(room => io.to('room-' + args.roomId).emit('rooms-users-promote'), {
			newOwner: user.id,
			oldOwner: userId
		}));
	});
	
	else if(args.type == 'users-add') Rooms.find({ where: {id: args.roomId, owner: userId} }).then(async room => {
		let results = [];

		if(!Array.isArray(args.userId)) args.userId = [args.userId];

		for (let i = 0; i < args.userId.length; i++) await Access.create({
			userId: args.userId,
			roomId: room.id,
			status: 1
		}).then(access => Users.find({ where: {id: args.userId} }).then(user => results.push({
			id: user.id,
			username: user.username
		})));

		io.to('room-' + args.roomId).emit('rooms-users-add', results);
	});

	else if(args.type == 'users-remove') Rooms.find({ where: {id: args.roomId, owner: userId} }).then(async room => {
		let results = [];

		if(!Array.isArray(args.userId)) args.userId = [args.userId];

		for (let i = 0; i < args.userId.length; i++) await Access.find(
			{where: {roomId: args.roomId, userId: args.userId[i]}
		}).then(access => access.update({status: 9}).then(access2 => results.push(access2.userId)));

		io.to('room-' + args.roomId).emit('rooms-users-remove', results);
	});

	else if(args.type == 'users-leave') Access.findOne({ where: {roomId: args.roomId, userId: userId} }).then(access => {

		if(!access) return callback({
			success: false,
			error:   'error.no-access'
		});

		Rooms.findOne({ where: {id: access.roomId, owner: userId} }).then(room => {

			if(room) return callback({
				success: false,
				error:   'error.rooms.owner-cant-leave'
			});

			access.update({
				status: 9
			}).then(access2 => {

				io.to('room-' + access.roomId).emit('rooms-users-remove', [access.userId]);

				return callback({
					success: true,
				});
			});
		});
	});

	else callback({
		success: false,
		error:   'error.rooms.type-not-found'
	});
}