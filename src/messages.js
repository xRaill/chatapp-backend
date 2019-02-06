module.exports = (io, socket, args, callback) => {

	let Messages = mod.model('messages');
	let Access   = mod.model('access');

	let Op = Sequelize.Op;

	if(args.type == 'get') Messages.findAll({
		where: {roomId: args.roomId, createdAt: {[Op.lt]: args.before || new Date()} },
		order: [[ 'createdAt', 'DESC' ]],
		limit: 50
	}).then(async messages => {
		let results = [];

		messages.reverse();

		for (let i = 0; i < messages.length; i++) await messages[i].getUser().then(user => Access.find({
			where: {
				userId: clientData[socket.id].userid,
				roomId: args.roomId,
				status: 1
			}
		}).then(access => results.push({
			id:        messages[i].id,
			userId:    user ? user.id : false,
			roomId:    messages[i].roomId,
			username:  user.status == 1 ? user.username : '[Removed]',
			message:   messages[i].message,
			read:      access.readAt > messages[i].createdAt,
			createdAt: messages[i].createdAt,
			updatedAt: messages[i].updatedAt
		})));

		return callback({
			success:  true,
			messages: results.length ? results : false
		});
	});

	else if(args.type == 'send') {

		if(!args.roomId) return callback({
			success: false,
			error:  'roomId not given'
		});

		if(args.message.length < 1 || 255 < args.message.length) return callback({
			success: false,
			error:  'Message is too long'
		});

		Messages.create({
			roomId:  args.roomId,
			userId:  clientData[socket.id].userid,
			message: args.message
		}).then(message => {

			io.to('room-' + args.roomId).emit('messages-add', [{
				id:        message.id,
				userId:    message.userId,
				roomId:    args.roomId,
				username:  clientData[socket.id].username,
				message:   message.message,
				read:      false,
				createdAt: message.createdAt,
				updatedAt: message.updatedAt
			}]);

			return callback({
				success: true
			});
		});
	}
}