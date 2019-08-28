module.exports = (io, socket, args, callback) => {

	let Tokens = mod.model('tokens');

	Tokens.findOne({ where: {token: clientData[socket.id].token} }).then(token => {

		if(!token) return callback({
			success: false,
			error:  'Can\'t find token'
		});

		token.update({ status: 9 }).then(token => {

			clientData[socket.id].loggedin = false;
			clientData[socket.id].userid   = null;
			clientData[socket.id].username = 'Anonymouse';
			clientData[socket.id].token    = null;

			return callback({
				success: true
			});
		});
	});
}