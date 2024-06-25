const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
//const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/renderer.tsx',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      "os": require.resolve("os-browserify/browser")
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
  ],
  devServer: {
    static: path.join(__dirname, 'public'),/*
    static: {
      directory: path.join(__dirname, 'dist')
      
    },*/
    compress: true,
    port: 9000
  }
};