let fs = require('fs');

module.exports.model = (model) => {
	let res;

	try {
		res = require('./model/' + model + '.js');
	} catch(err) {
		console.log("\x1b[41m", "'"+ model +"' model error:", err, "\x1b[0m");
		process.exit();
	}

	return res;
}

module.exports.action = (io, socket, data, callback) => {
	let res;

	// console.log(data);
	if(data) console.log('Request type: ' + data.type);

	let file = data.type.split('.')[0] + '.js';
	
	data.type = data.type.split('.').pop();

	if(fs.existsSync('./src/' + file)) {
		try {
			res = require('./' + file);
		} catch(err) {
			console.log("\x1b[41m", "'"+ data.type +"' request error:", err, "\x1b[0m");
			process.exit();
		}


		return res(io, socket, data, callback);
	} else return () => console.log("\x1b[41m", data.type +" requested but does not exist", "\x1b[0m");
}