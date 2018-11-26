module.exports = (io, socket, args) => {

	if(!clientData[socket.id].loggedin) return socket.emit('logout');

	let Users = mod.model('user');
	let Friends = mod.model('friends');

	if(args.type == 'get') {
		Users.find({ where: {id: clientData[socket.id].userid} }).then(user => {		
			user.getFriend().then(friends => {
				for (let i = 0; i < friends.length; i++) socket.emit('friend-add', {
					id:       friends[i].id,
					username: friends[i].username
				});
			});
			user.getFriend2().then(friends => {
				for (let i = 0; i < friends.length; i++) socket.emit('friend-add', {
					id:       friends[i].id,
					username: friends[i].username
				});
			});
		});
	} else if(args.type == 'add') {
		console.log('Adding user');
		Users.find({ where: {id: clientData[socket.id].userid} }).then(user => {
			Users.find({ where: {id: args.friendId} }).then(friend => {
				socket.send('friend-add', friend);
				Friends.create({
					userId: user.id,
					friendId: friend.id,
					status: 1
				});
			});
		});
	}
}