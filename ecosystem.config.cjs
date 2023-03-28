module.exports = {
	apps: [
		{
			name: 'sayce',
			script: 'node -r dotenv/config build',
			env_production: {
				NODE_ENV: 'production',
				PORT: 5173
			}
		},
		{
			name: 'sayceback',
			script: 'cd backend && npm run start'
		}
	]
};
