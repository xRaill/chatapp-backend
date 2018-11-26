module.exports = (io, socket, args)=> {

	let userModel = mod.model('user');
	let OP = Sequelize.Op;

	if(args.search.length <= 3) return socket.emit('search-response', false);

	userModel.findAll({
		where: {
			username: { [OP.like]: '%' + args.search + '%' }
		},
		limit: 10
	}).then(users => {
		let usernames = [];

		for (var i = 0; i < users.length; i++) usernames.push(users[i].username);

		socket.emit('search-response', usernames);
	});

}