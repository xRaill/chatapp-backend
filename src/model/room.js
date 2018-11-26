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
	owner: {
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		type: Sequelize.INTEGER,
		allowNull: false
	}
}, {
	freezeTableName: true
});

module.exports = Room;