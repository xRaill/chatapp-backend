module.exports = (io, socket, args, callback) => {

	let Tokens = mod.model('tokens'); 
	let Users  = mod.model('users');

	Tokens.find({ where: {token: args.token, status: 1} }).then(token => {

		if(!token) return callback({
			success: false,
			error:   'error.authenticate.no-token'
		});

		Users.find({ where: {id: token.userId} }).then(user => {

			if(!user) return callback({
				success: false,
				error:   'error.authenticate.invalid-token'
			});

			clientData[socket.id].loggedin = true;
			clientData[socket.id].username = user.username;
			clientData[socket.id].userid   = user.id;
			
			return callback({
				success:  true,
				userId:   user.id,
				username: user.username
			});

		});

	});

}