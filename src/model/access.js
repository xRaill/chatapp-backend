let Access = sequelize.define('access', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	userId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	roomId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	status: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	readAt: {
		type: Sequelize.DATE,
		defaultValue: new Date(),
		allowNull: false
	}
}, {
	freezeTableName: true
});

module.exports = Access;