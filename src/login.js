let bcrypt = require('bcryptjs');

module.exports = (io, socket, args) => {

	let userModel = mod.model('user');
	let tokensModel = mod.model('tokens');

	userModel.findOne({ where: {username: args.username} }).then(user => {
		if(user) bcrypt.compare(args.password, user.password).then(res => {
			if(res) {
				clientData[socket.id].loggedin = true;
				clientData[socket.id].username = user.username;
				clientData[socket.id].userid = user.id;
				tokensModel.create({
					userId: user.id,
					token: bcrypt.genSaltSync(8),
					status: 1
				}).then(token => socket.emit('login', {
					success: true,
					username: user.username,
					userid: user.id,
					token: token.token
				}));
			} else socket.emit('login', {
				success: false,
				type: 'toast',
				message: 'Incorrect login information'
			});
		});
		else socket.emit('login', {
			success: false,
			type: 'toast',
			message: 'Incorrect login information'
		});
	});
}