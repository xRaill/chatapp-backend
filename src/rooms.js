module.exports = (io, socket, args) => {

	if(!clientData[socket.id].loggedin) return socket.emit('logout');

	let Users  = mod.model('user');
	let Access = mod.model('access');
	let Rooms  = mod.model('room');


	if(args.type == 'get') Access.findAll({ where: {userId: clientData[socket.id].userid, status: 1}}).then(async access => {
		let results = [];

		for (let i = 0; i < access.length; i++) await Rooms.find({ where: {id: access[i].roomId} }).then(room => results.push(room));

		socket.emit('rooms-add', results.length ? results : false);
	});

	else if(args.type == 'add') User.find({ where: {id: clientData[socket.id].userid}}).then(user => {
		Rooms.create({
			name: args.name ? args.name : 'Unnamed Room',
			owner: clientData[socket.id],
			status: 1 
		}).then(room => Access.create({
			userId: clientData[socket.id].userid,
			roomId: room.id,
			status: 1
		}).then(access => socket.emit('rooms-add', [room])));
	});
}