module.exports = (io, socket, args) => {

	if(!clientData[socket.id].loggedin) return socket.emit('logout');

	let messagesModel = mod.model('messages');

	if(args.type == 'get') messagesModel.findAll({ where: {roomId: args.roomId} }).then(messages => {

		if(messages.length) {
			let response = [];

			for (let i = 0; i < messages.length; i++) messages[i].getUser().then(user => {
				response.push({
					id: messages[i].id,
					userId: user.id,
					username: user.username,
					message: messages[i].message,
					createdAt: messages[i].createdAt,
					updatedAt: messages[i].updatedAt
				});

				if(messages.length -1 == i) socket.emit('message-add', response);
			});
		} else socket.emit('message-add', false);
	});

	else if (args.type == 'send') messagesModel.create({
		roomId: args.roomId,
		userId: clientData[socket.id].userid,
		message: args.message
	}).then(message => {
		if(message) io.to('room-'+ args.roomId).emit('message-add', [{
			id: message.id,
			userId: message.userId,
			username: clientData[socket.id].username,
			message: message.message,
			createdAt: message.createdAt,
			updatedAt: message.updatedAt
		}]);
	});
}