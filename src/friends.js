module.exports = (io, socket, args) => {

	if(!clientData[socket.id].loggedin) return socket.emit('logout');

	let Users = mod.model('user');
	let Friends = mod.model('friends');
	let Op = Sequelize.Op;

	let userId = clientData[socket.id].userid;

	if(args.type == 'get') Friends.findAll({
		where: {
			[Op.or]: [
				{userId:   userId},
				{friendId: userId}
			]
		} 
	}).then(async friends => {
		let results = [];

		for (let i = 0; i < friends.length; i++) {
			if(friends[i].userId == userId) await Users.find({ where: {id: friends[i].friendId} }).then(user => results.push({
				id:       user.id,
				username: user.username
			}));
			else await Users.find({ where: {id: friends[i].userId} }).then(user => results.push({
				id:       user.id,
				username: user.username
			}));
		}

		socket.emit('friends-add', friends.length ? results : false);
	});

	else if(args.type == 'add') Users.find({ where: {id: clientData[socket.id].userid} }).then(user => {
		Users.find({ where: {id: args.friendId} }).then(friend => {
			socket.send('friends-add', [friend]);
			Friends.create({
				userId:   user.id,
				friendId: friend.id,
				status: 1
			});
		});
	});
}