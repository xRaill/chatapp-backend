module.exports = (io, socket, args, callback) => {

	let Friends = mod.model('friends');
	let Users   = mod.model('user');

	let userId = clientData[socket.id].userid;
	let Op = Sequelize.Op;

	if(args.type == 'get') Friends.findAll({
		where: {
			[Op.or]: [{userId: userId}, {friendId: userId}],
			status:  {[Op.or]: [0, 1]}
		}
	}).then(async friends => {
		let results = [];

		for (let i = 0; i < friends.length; i++) {
			if(friends[i].userId == userId) await Users.find({ where: {id: friends[i].friendId} }).then(user => results.push({
				id:       user.id,
				request:  false,
				username: user.username
			}));
			else await Users.find({ where: {id: friends[i].userId} }).then(user => results.push({
				id:       user.id,
				request:  friends[i].status ? true : false,
				username: user.username
			}));
		}

		return callback({
			success: true,
			friends: results.length ? results : false
		});
	});

	else if(args.type == 'request') Friends.find({
		where: {
			userId:   userId,
			friendId: args.friendId,
			status:   {[Op.or]: [0, 1]}
		}
	}).then(friend => {
		
		if(friend && friend.status == 1) return callback({
			success: false,
			error:  'Already friends.'
		});

		if(friend && friend.status == 0) return callback({
			success: false,
			error:  'Friend request already send'
		});

		Users.find({ where: {id: args.friendId} }).then(user => Friends.create({
			userId:   userId,
			friendId: user.id,
			status:   0
		}).then(friend => {

			let socketId = Object.entries(clientData).find(a => a[1].userid == user.id);
			if(socketId) io.sockets.connected[socketId].socket.emit('friends-request', user);

			return callback({
				success: true
			});
		}));
	});

	else if(args.type == 'accept') Friends.find({ where: {userId: args.friendId, friendId: userId, status: 0} }).then(friend => {

		if(!friend) return callback({
			success: false,
			error:  'Friend request not found'
		});

		friend.update({ status: 1 }).then(friend => Users.find({ where: {id: friend.friendId} }).then(user => {

			let socketId = Object.entries(clientData).find(a => a[1].userid == friend.userId);
			if(socketId) io.sockets.connected[socketId].socket.emit('friends-accept', user);

			return callback({
				success: true
			});
		}));
	});

	else if(args.type == 'deny') Friends.find({ where: {userId: args.friendId, friendId: userId, status: 0} }).then(friend => {

		if(!friend) return callback({
			success: true,
			error:  'Friend request not found'
		});

		friend.update({ status: 9 }).then(friend => callback({
			success: true
		}));
	});

	else if(args.type == 'remove') Friends.find({ where: {
		[Op.or]: [
			{[Op.and]: [
				{userId:   userId},
				{friendId: args.friendId}
			]},
			{[Op.and]: [
				{userId:   args.friendId},
				{friendId: userId}
			]},
		],
		status:  1
	} }).then(friend => {

		if(!friend) return callback({
			success: false,
			error:  'User is not friend'
		});

		friend.update({
			status: 9
		}).then(friend => {

			let socketId = Object.entries(clientData).find(a => a[1].userid == args.friendId);
			if(socketId) io.sockets.connected[socketId].socket.emit('friends-remove', {
				id: args.friendId
			});

			return callback({
				success: true
			});

		});
	});
}