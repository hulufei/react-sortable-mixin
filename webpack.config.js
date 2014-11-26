module.exports = {
	entry: './demo/index',
	output: {
		path: 'build',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{ test: /\.js$/, loader: 'jsx' }
		]
	}
};
