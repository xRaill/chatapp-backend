const middleware = require('socketio-wildcard')();
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

mod.action(io, socket, { type: 'database' }, () => {
	app    = http.createServer(handler);
	io     = require('socket.io').listen(app);
	socket = io.path('/');

	io.use(middleware);

	fs.readFile('settings.json', 'utf8', (err, data) => app.listen(JSON.parse(data).port, () => console.log('Server successfully started')));

	io.on('connection', (socket) => {
		console.log(socket.id +' connected');
		clientData[socket.id] = {
			loggedin: false,
			username: 'Anonymous'
		};
		socket.emit('connected');

		socket.on('*', (req) => {
			let callback = () => {};
			let data = req.data || {};

			if(!(data[0] instanceof Object)) return;

			if(data[1] instanceof Function) callback = data[1];

			mod.action(io, socket, data[0], callback);
		});

		socket.on('disconnect', () => {
			let Tokens = mod.model('tokens');

			Tokens.update({ updatedAt: null }, { where: {token: clientData[socket.id].token} });

			delete clientData[socket.id];
		});

	});

});