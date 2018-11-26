let Room = sequelize.define('room', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	name: {
		type: Sequelize.STRING,
		allowNull: true
	},
	status: {
		type: Sequelize.INTEGER,
		allowNull: false
	}
}, {
	freezeTableName: true
});

module.exports = Room;