let bcrypt = require('bcryptjs');

module.exports = (io, socket, args, callback) => {

	let Users  = mod.model('user');
	let Tokens = mod.model('tokens');

	Users.find({ where: {username: args.username} }).then(user => {

		if(!user) return callback({
			success: false,
			error:   'error.login.wrong-information'
		});

		bcrypt.compare(args.password, user.password).then(res => {

			if(!res) return callback({
				success: false,
				error:   'error.login.wrong-information'
			});

			if(user.status == 8) return callback({
				success: false,
				error:   'error.login.access-denied'
			});

			clientData[socket.id].loggedin = true;
			clientData[socket.id].username = user.username;
			clientData[socket.id].userid   = user.id;

			if(args.accessToken) Tokens.create({
				userId: user.id,
				token:  bcrypt.genSaltSync(8),
				status: 1
			}).then(token => callback({
				success:  true,
				userId:   user.id,
				username: user.username,
				token:    token.token
			}));

			else callback({
				success:  true,
				userId:   user.id,
				username: user.username
			});
		});
	});
}