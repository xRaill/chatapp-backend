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
		type: Sequelize.STRING(40),
		allowNull: false
	},
	keep: {
		type: Sequelize.BOOLEAN,
		defaultValue: false
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