let fs = require('fs');

module.exports = (callback) => {

	fs.readFile('settings.json', 'utf8', (err, data) => {

		if(err) {
			console.log("\x1b[41m", "Can't find 'settings.json' file", "\x1b[0m");
			process.exit();
		}

		let settings = JSON.parse(data);

		sequelize = new Sequelize(settings.dbname, settings.dbuser, settings.dbpass, {
			host: settings.dbhost,
			dialect: 'mysql',
			operatorsAliases: false,
			logging: settings.logging,

			pool: {
				max: 5,
				min: 0,
				acquire: 30000,
				idle: 10000
			}
		});

		sequelize.authenticate().then(() => {
			console.log("\x1b[44m", 'Database connection successful', "\x1b[0m");

			// Check and update all models
			fs.readdir('./src/model/', (err, files) => {
				let i = files.length -1;
				files.forEach((file, a) => mod.model(file.split('.')[0]).sync({ alter: true }).then(result => {
					console.log("\x1b[44m" ,'synchronized', file.split('.')[0], "\x1b[0m");
					if(!i--) callback(); 
				}));
			});

		}).catch(err => {
			console.log("\x1b[41m", 'Unable to connect to the database: ', err, "\x1b[0m");
			process.exit();
		});
	});
}