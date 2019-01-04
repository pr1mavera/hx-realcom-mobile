'use strict'
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/redirect.js',
    output: {
        path: __dirname,
        filename: './release/redirect.js'
    },

    module: {
        rules: [{
        test: /\.js?$/,
        exclude: /(node_modules)/,
        loader: 'babel-loader'
        }]
    },
    devServer: {
        contentBase: path.join(__dirname, './release'),
        open: true,
        port: 8081
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './redirect.html',
            inject: true
        })
    ]
}