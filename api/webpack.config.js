const nodeExternals = require('webpack-node-externals')
const serverlessWebpack = require('serverless-webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
	devtool: 'inline-cheap-module-source-map',
	entry: serverlessWebpack.lib.entries,
	mode: serverlessWebpack.lib.webpack.isLocal ? 'development' : 'production',
	module: {
		rules: [
			{
				exclude: /node_modules/,
				test: /\.ts$/,
				use: 'ts-loader',
			},
			{
				test: /\.(graphql|gql)$/,
				exclude: /node_modules/,
				loader: '@graphql-tools/webpack-loader',
			},
			{
				test: /schema.prisma/,
				exclude: /node_modules/,
				loader: 'raw',
			},
		],
	},
	node: false,
	externals: [nodeExternals()],
	optimization: { minimize: false },
	resolve: {
		extensions: ['.ts', '.js', '.graphql'],
	},
	target: 'node',
	plugins: [
		new CopyWebpackPlugin({
			patterns: ['./prisma/schema.prisma'],
		}),
	],
}
