let bcrypt = require('bcryptjs');

module.exports = (io, socket, args) => {

	let user = mod.model('user');

	user.findOne({
		where: {
			username: args.username
		}
	}).then(res => {
		if(!res) {
			// Username does not exist, hash password and create account
			bcrypt.hash(args.password, bcrypt.genSaltSync(8)).then(password => {
				user.create({
					username: args.username,
					password: password,
					status: '1'
				}).then(result => {
					if(result) socket.emit('register', {success: true});
					else socket.emit('register', {
						success: false,
						type: 'toast',
						message: 'An error occured'
					});
				});
			});
		} else {
			// Username already exists
			socket.emit('register', {
				success: false,
				type: 'username',
				message: 'Username already exists!'
			});
		}
	});
}