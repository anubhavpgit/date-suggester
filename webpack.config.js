// webpack.config.js
const path = require('path');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	entry: './src/main.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			}
		]
	},
	plugins: [
		// Load environment variables from .env file
		new Dotenv(),
		// Generate HTML file that includes reference to bundled JS
		new HtmlWebpackPlugin({
			template: './src/index.html',
			filename: 'index.html'
		}),
		// Provide polyfills for Node.js core modules
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
	],
	resolve: {
		fallback: {
			"path": require.resolve("path-browserify"),
			"os": require.resolve("os-browserify/browser"),
			"crypto": require.resolve("crypto-browserify"),
			"buffer": require.resolve("buffer/"),
			"stream": require.resolve("stream-browserify"),
		}
	},
	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'),
		},
		compress: true,
		port: 9000,
	},
};