module.exports = (io, socket, args, callback) => {

	let Tokens = mod.model('tokens'); 
	let Users  = mod.model('user');
	let Access = mod.model('access');

	Tokens.find({ where: {token: args.token, status: 1} }).then(token => {

		if(!token) return callback({
			success: false,
			error:  'Token not found.'
		});

		let date = new Date(token.updatedAt);
		date = date.setMinutes(date.getMinutes() +20);

		if(!token.keep && new Date() > date) return token.destroy().then(token => callback({
			success: false,
			error:  'Token is outdated'
		}));

		Users.find({ where: {id: token.userId} }).then(user => {

			if(!user) return callback({
				success: false,
				error:  'User associated with token not found'
			});

			if(user.status == 8) return callback({
				success: false,
				error:  'User has been banned'
			});

			Tokens.update({ updatedAt: null }, { where: {token: token.token}});

			Access.findAll({ where: {userId: user.id, status: 1} }).then(access => {
				for (let i = 0; i < access.length; i++) socket.join('room-'+ access[i].roomId)
			});

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
}