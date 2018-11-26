module.exports = (io, socket) => {

	if(!clientData[socket.id].loggedin) return socket.emit('logout');

	let accessModel = mod.model('access');
	let roomModel   = mod.model('room');

	accessModel.findAll({ where: {userId: clientData[socket.id].userid, status: 1} }).then(access => {

		if(!access.length) {
			// socket.emit('room-add', {});
			socket.emit('test', 'No access found');
			socket.emit('test', clientData[socket.id]);
		} else {
			for (let i = access.length - 1; i >= 0; i--) roomModel.findOne({ where: {id: access[i].roomId} }).then(room => {
				socket.join('room-'+ room.id);
				socket.emit('room-add', room);
				socket.emit('test', room);
			});
		}
	});
}