const http = require('http');

global.mod        = require('./src/index.js');
global.Sequelize  = require('sequelize');
global.clientData = {};
global.sequelize;

let io, socket, app;

function handler(req, res) {
	res.writeHead(200);
	res.end('Server is active!');
}

mod.action('database', () => {

	app    = http.createServer(handler);
	io     = require('socket.io').listen(app);
	socket = io.path('/');

	app.listen(8080, () => console.log('Created active on *:8080', "\x1b[0m"));

	io.on('connection', (socket) => {
		console.log(socket.id +' connected');
		clientData[socket.id] = {
			loggedin: false,
			username: 'Anonymous'
		};
		socket.emit('connected');
		socket.on('action', (type, args = {}, callback = () => {}) => mod.action(type, io, socket, args, callback));
		socket.on('toastall', () => io.emit('toast'));
		socket.on('clientdata', () => socket.emit('test', clientData));
		socket.on('disconnect', () => delete clientData[socket.id]);
	});

});






// io.on('connection', (socket) => {
// 	console.log(socket.id +' connected');
// 	clientData[socket.id] = {
// 		loggedin: false,
// 		username: 'Anonymous'
// 	};
// 	socket.emit('connected');
// 	socket.on('action', (type, args = {}, callback = () => {}) => mod.action(type, io, socket, args, callback));
// 	socket.on('toastall', () => io.emit('toast'));
// 	socket.on('clientdata', () => socket.emit('test', clientData));
// 	socket.on('disconnect', () => delete clientData[socket.id]);
// });

// app.listen(8080, () => {
// 	console.log('listening on *:8080');
// 	(mod.action('database'))();
// });