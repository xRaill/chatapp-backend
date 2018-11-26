module.exports = (io, socket, roomid) => {

	// SEND FAKEMMSG

	io.emit('msg', {
		id: 1,
		message: 'TEST',
		status: 1,
		createdAt: "2018-10-31T00:00:00.000Z",
		updatedAt: "2018-10-31T00:00:00.000Z"
	});


	// let User = mod.model('user');
	// let Access = mod.model('access');
	// let Room = mod.model('room');

	// Access.belongsTo(mod.model('user'), {foreignKey: 'roomId'});

	// socket.emit('test', access);
	// console.log(access);

	// Room.findAll().then(room => socket.emit('test', room));
	// User.findAll().then(user => socket.emit('test', user));
	


	// Access.findAll().then(access => {
	// 	socket.emit('test', access);
	// 	for (var i = 0; i < access.length; i++) {
	// 		access[i].getUser().then(access2 => socket.emit('test', access2));
	// 	};
	// });

	// User.findAll().then(users => {
	// 	for (var i = 0; i < users.length; i++) {
	// 		users[i].getFriends().then(result => {
	// 			socket.emit('test', result);
	// 		});
	// 	}
	// });

	// Room.find({ where: {status: 1} }).then(room => {
	// 	User.find({ where: {status: 1} }).then(user => {
	// 		Room.addUser(user);
	// 	});

	// 	socket.emit('test', room);
	// });

}

/*	
 / Associations Explenation =  https://stackoverflow.com/a/25072476
*/