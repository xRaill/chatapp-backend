let Friends = sequelize.define('friends', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	userId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	friendId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	status: {
		type: Sequelize.INTEGER,
		allowNull: false
	}
}, {
	freezeTableNames: true
});

module.exports = Friends;