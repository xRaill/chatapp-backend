let Messages = sequelize.define('messages', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	roomId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	userId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	message: {
		type: Sequelize.TEXT,
		allowNull: false
	}
}, {
	freezeTableName: true
});

Messages.belongsTo(mod.model('room'));
Messages.belongsTo(mod.model('user'));

module.exports = Messages;