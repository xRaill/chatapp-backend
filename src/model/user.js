let bcrypt = require('bcryptjs');

let User = sequelize.define('user', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true,
	},
	username: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			is: /^[a-z0-9]+$/i,
			len: [5,18]
		}
	},
	password: {
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

module.exports = User;