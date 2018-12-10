module.exports = (io, socket, args, callback)=> {

	let Friends = mod.model('friends'); 
	let Users   = mod.model('user');

	let userId = clientData[socket.id].userid; 
	let Op     = Sequelize.Op;

	if(args.type == 'users') {

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

			for (let i = 0; i < users.length; i++) await Friends.find({
				where: {
					[Op.or]: [
						{[Op.and]: [
							{userId:   userId},
							{friendId: users[i].id}
						]},
						{[Op.and]: [
							{userId:   users[i].id},
							{friendId: userId}
						]},
					]
				} 
			}).then(friends => results.push({
				id:       users[i].id,
				username: users[i].username,
				self:     users[i].id == userId ? true : false,
				friends:  friends ? (friends.status === 1 ? true : false) : false,
				request:  friends ? (friends.status === 0 ? true : false) : false
			}));

			return callback({
				success: true,
				users:   results
			});
		});

	}

}