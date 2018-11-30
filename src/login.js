let bcrypt = require('bcryptjs');
let crypto = require('crypto');

module.exports = (io, socket, args, callback) => {

	let Users  = mod.model('user');
	let Tokens = mod.model('tokens');
	let Access = mod.model('access');

	Users.find({ where: {username: args.username} }).then(user => {

		if(!user) return callback({
			success: false,
			error:  'Wrong login information'
		});

		bcrypt.compare(args.password, user.password).then(res => {

			if(!res) return callback({
				success: false,
				error:  'Wrong login information'
			});

			if(user.status == 8) return callback({
				success: false,
				error:  'User has been banned'
			});


			Access.findAll({ where: {userId: user.id, status: 1} }).then(access => {
				for (let i = 0; i < access.length; i++) socket.join('room-'+ access[i].roomId)
			});

			Tokens.create({
				userId: user.id,
				token:  crypto.randomBytes(20).toString('hex'),
				keep:   args.stayLoggedIn ? true : false,
				status: 1
			}).then(token => {

				clientData[socket.id].loggedin = true;
				clientData[socket.id].username = user.username;
				clientData[socket.id].userid   = user.id;
				clientData[socket.id].token    = token.token;

				return callback({
					success:  true,
					userId:   user.id,
					username: user.username,
					token:    token.token
				});
			});
		});
	});
}