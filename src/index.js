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

module.exports.action = (action, a, b, c, d) => {
	let res;

	console.log('Requesting action: ' + action)

	let file = action + '.js';

	if(fs.existsSync('./src/' + file)) {
		try {
			res = require('./' + file);
		} catch(err) {
			console.log("\x1b[41m", "'"+ action +"' action error:", err, "\x1b[0m");
			process.exit();
		}
		return res(a, b, c, d);
	} else return () => console.log("\x1b[41m", "Action '"+ action +"' requested but does not exist", "\x1b[0m");
}