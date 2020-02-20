const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { NetlifyHeaders, NetlifyRedirects } = require('../dist/index');

module.exports = {
  entry: path.resolve(__dirname, './index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: '/'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader'
      }
    ]
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    port: 8000
  },
  plugins: [
    new HtmlWebpackPlugin(),
    new NetlifyHeaders({
      'x-from': 'netlify-test'
    }),
    new NetlifyRedirects([
      {
        from: '/netlify/*',
        to: 'https://www.netlify.com/docs/:splat',
        status: '200!'
      },
      {
        from: '/pass-through/*',
        to: 'https://www.netlify.com/docs/:splat',
        status: 200
      },
      {
        from: '/*',
        to: '/index.html',
        status: 200
      }
    ])
  ]
};
