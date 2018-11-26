	let Tokens = sequelize.define('tokens', {
	id: {
		type: Sequelize.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	userId: {
		type: Sequelize.INTEGER,
		allowNull: false
	},
	token: {
		type: Sequelize.STRING,
		allowNull: false
	},
	status: {
		type: Sequelize.INTEGER,
		allowNull: false
	}
}, {
	freezeTableNames: true
});

// Tokens.hasOne(mod.model('user'))

module.exports = Tokens;