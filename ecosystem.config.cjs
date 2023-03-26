module.exports = {
	apps: [
		{
			name: 'sayce',
			script: 'build/index.js',
			env_production: {
				NODE_ENV: 'production',
				PORT: 5173
			}
		},
		{
			name: 'sayce backend',
			script: 'cd backend && npm run start'
		}
	]
};
