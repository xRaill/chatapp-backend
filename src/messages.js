module.exports = (io, socket, args, callback) => {

	let Messages = mod.model('messages');

	if(args.type == 'get') Messages.findAll({ where: {roomId: args.roomId} }).then(async messages => {
		
		if(!messages) return callback({
			success:  true,
			messages: false
		});

		let response = [];

		for (let i = 0; i < messages.length; i++) await messages[i].getUser().then(user => response.push({
			id:        messages[i].id,
			userId:    user ? user.id : false,
			username:  user.status != 1 ? user.username : '[Removed]',
			message:   message[i].message,
			createdAt: messages[i].createdAt,
			updatedAt: messages[i].updatedAt
		}));

		return callback({
			success: true,
			messages: response
		});
	});

	else if (args.type == 'send') {

		if(args.message.length < 1 || 255 > args.message.length) return callback({
			success: false,
			error:   'error.messages.short'
		});

		Messages.create({
			roomId:  args.roomId,
			userId:  clientData[socket.id].userid,
			message: args.message
		}).then(message => {

			if(!message) return callback({
				success: false,
				error:   'error.database.action'
			});

			io.to('room-' + args.roomId).emit('message-add', [{
				id:        message.id,
				userId:    message.userId,
				message:   message.message,
				createdAt: message.createdAt,
				updatedAt: message.updatedAt
			}]);
		});
	}
}