const http = require('http');
const fs = require('fs');

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

	fs.readFile('settings.json', 'utf8', (err, data) => app.listen(JSON.parse(data).port, () => console.log('Server successfully started')));

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
		
		socket.on('disconnect', () => {
			let Tokens = mod.model('tokens');

			Tokens.update({ updatedAt: null }, { where: {token: clientData[socket.id].token} });

			delete clientData[socket.id];
		});
	});

});