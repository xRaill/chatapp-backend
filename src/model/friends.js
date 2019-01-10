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

Friends.belongsTo(mod.model('user'));

Friends.belongsTo(mod.model('user'), {
	foreignKey: 'friendId',
	as: 'friend'
});

module.exports = Friends;