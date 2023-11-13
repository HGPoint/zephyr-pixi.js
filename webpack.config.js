var path = require('path');
const webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin'); 

module.exports = (env, argv) => ({  
  mode: argv.mode === 'production' ? 'production' : 'development',

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',
 
  entry: {
    ui: '/src/ui/ui.tsx', // The entry point for your UI code
    code: './src/plugin/code.ts', // The entry point for your plugin code
  },
  resolve: {
     extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      // {
      //   test: /\.(js)$/,
      //   use: 'babel-loader',
      // },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'postcss-loader',
        ],
      },
      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      //{ test: /\.(png|jpg|gif|webp|zip)$/, use: [{ loader: 'url-loader' }] },
      {
          test: /\.(jpe?g|png|ttf|eot|woff(2)?)(\?[a-z0-9=&.]+)?$/,
          use: 'base64-inline-loader'
      },
      {
        test: /\.svg/,
        type: 'asset/inline',
      },
    ],
  },
  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'code'
        ? 'code.js'
        : '[name].[contenthash].js';
    },
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
    // Clean the output directory before emit.
    clean: true,
    publicPath: '',
  },
  plugins: [
    new webpack.DefinePlugin({
      global: {}, // Fix missing symbol error when running in developer VM
    }),
    new NodePolyfillPlugin({
        includeAliases: ['browser', 'process', 'path']
    }),
    new HtmlWebpackPlugin({
      inject: 'body',
      template: './src/ui/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
    }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/ui.html/],
      scriptMatchPattern: [/.js$/],
    }),
  ],
});
