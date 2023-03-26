module.exports = {
	apps: [
		// First application
		{
			name: 'sayce',
			script: 'build/index.js',
			env_production: {
				NODE_ENV: 'production',
				PORT: 5173
			}
		}
	]
};
