const app = require('http').createServer(handler);
const io = require('socket.io').listen(app);
const socket = io.path('/');

global.mod       = require('./src/index.js');
global.Sequelize = require('sequelize');
global.sequelize;
global.clientData = {};

function handler(req, res) {
	res.writeHead(200);
	res.end('Server is active!');
}

io.on('connection', (socket) => {
	console.log(socket.id +' connected');
	clientData[socket.id] = {
		loggedin: false,
		username: 'Anonymous'
	};
	socket.emit('connected');
	socket.on('action', (type, args = {}, callback) => (mod.action(type))(io, socket,args, callback));
	socket.on('toastall', () => io.emit('toast'));
	socket.on('clientdata', () => socket.emit('test', clientData));
	socket.on('disconnect', () => delete clientData[socket.id]);
});

app.listen(8080, () => {
	console.log('listening on *:8080');
	(mod.action('database'))();
});