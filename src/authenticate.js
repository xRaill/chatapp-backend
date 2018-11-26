module.exports = (io, socket, args) => {

	let userModel = mod.model('user');
	let tokensModel = mod.model('tokens');

	tokensModel.findOne({ where: { token: args.token, status: 1} }).then(token => {

		if(token) userModel.findOne({ where: {id: token.userId} }).then(user => {
			clientData[socket.id].loggedin = true;
			clientData[socket.id].username = user.username;
			clientData[socket.id].userid = user.id;
			socket.emit('authenticate-return', {
				userId: user.id,
				username: user.username
			});
			// user.getTokens().then(user => console.log(user.dataValues));
		});
		else socket.emit('router', 'login');

		// token.getUser().then(user => console.log(user.dataValues));
	});

}