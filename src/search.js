module.exports = (io, socket, args, callback)=> {

	let Friends = mod.model('friends'); 
	let Access  = mod.model('access'); 
	let Users   = mod.model('user');

	let userId = clientData[socket.id].userid; 
	let Op     = Sequelize.Op;

	if(args.type == 'users') {

		if(!args.search) return callback({
			success: false,
			error:  'No search value provided'
		});

		if(args.search.length <= 3) return callback({
			success: false,
			error:  'Search must be longer than 3'
		});

		Users.findAll({
			where: {
				username: { [Op.like]: '%' + args.search + '%' },
				status:   1
			},
			limit: 10
		}).then(async users => {
			let results = [];

			for (let i = 0; i < users.length; i++) await Friends.findOne({
				where: {
					[Op.or]: [
						{[Op.and]: [
							{userId:   userId},
							{friendId: users[i].id}
						]},
						{[Op.and]: [
							{userId:   users[i].id},
							{friendId: userId}
						]}
					],
					status: {[Op.or]: [0,1]}
				} 
			}).then(friends => results.push({
				id:       users[i].id,
				username: users[i].username,
				self:     users[i].id == userId ? true : false,
				friends:  friends ? (friends.status === 1 ? true : false) : false,
				request:  friends ? (friends.status === 0 ? (friends.userId == userId ? true : false) : false) : false
			}));

			return callback({
				success: true,
				users:   results
			});
		});

	}

	else if(args.type == 'friends') Friends.findAll({
		where: {
			[Op.or]: [
				{userId: userId},
				{friendId: userId}
			],
			status: 1
		}
	}).then(async friends => {

		if(!args.roomId) return callback({
			success: false,
			error:  'No roomId given'
		});

		let results = [];

		for (let i = 0; i < friends.length; i++) {
			if(friends[i].userId == userId) await Users.findOne({
				where: {
					id: friends[i].friendId,
					username: { [Op.like]: '%' + args.search + '%' }
				} 
			}).then(async user => { if(user) await Access.findOne({
				where: {
					userId: user.id,
					roomId: args.roomId,
					status: 1
				}
			}).then(async access => await results.push({
				id:       user.id,
				username: user.username,
				inGroup:  access ? true : false
			}))});

			else await Users.findOne({
				where: {
					id: friends[i].userId,
					username: { [Op.like]: '%' + args.search + '%' }
				}
			}).then(async user => { if(user) await Access.findOne({
				where: {
					userId: user.id,
					roomId: args.roomId,
					status: 1
				}
			}).then(async access => await results.push({
				id:       user.id,
				username: user.username,
				inGroup:  access ? true : false
			}))});
		}

		return callback({
			success: true,
			friends: results
		});

	});

}