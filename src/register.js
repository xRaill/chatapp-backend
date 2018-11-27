let bcrypt = require('bcryptjs');

module.exports = (io, socket, args, callback) => {

	let Users = mod.model('user');

	Users.find({ where: {username: args.username}}).then(res => {
		
		if(res) return callback({
			success: false,
			error:   'error.register.username-already-exists'
		});

		if(args.username.length < 5 || 18 < args.username.length) return callback({
			success: false,
			error:   'error.register.username-invalid'
		});

		if(!/^[a-z0-9]+$/i.test(args.username)) return callback ({
			success: false,
			error:   'error.register.username-invalid'
		});

		if(args.password.length < 7 || 30 < args.password.length) return callback({
			success: false,
			error:   'error.register.password-invalid'
		});

		bcrypt.hash(args.password, bcrypt.genSaltSync(8)).then(hash => Users.create({
			username: args.username,
			password: hash,
			status: 1
		}).then(user => {

			if(!user) return callback({
				success: false,
				error:   'error.database.action'
			});

			clientData[socket.id].loggedin = true;
			clientData[socket.id].username = user.username;
			clientData[socket.id].userid   = user.id;

			return callback({
				success:  true,
				userId:   user.id,
				username: user.username
			});
		}));
	});
}