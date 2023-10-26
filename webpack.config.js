const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
   mode: argv.mode === 'production' ? 'production' : 'development',

   // This is necessary because Figma's 'eval' works differently than normal eval
   devtool: argv.mode === 'production' ? false : 'inline-source-map',
 
    entry: {
        ui: './src/ui/ui.tsx', // The entry point for your UI code
        code: './src/plugin/code.ts', // The entry point for your plugin code
    },
   //entry: './src/code.ts',
   mode: 'development',
   devtool: 'inline-source-map',
   watch: true,
   output: {
      filename: 'code.js',
      path: path.resolve(__dirname, 'dist'),
   },
   resolve: {
      extensions: ['.ts', '.js'],
   },
   module: {
      rules: [
        // Converts TypeScript code to JavaScript
      {
         test: /\.tsx?$/,
         use: 'ts-loader',
         exclude: /node_modules/,
       },
 
       // Enables including CSS by doing "import './file.css'" in your TypeScript code
       {
         test: /\.css$/,
         use: ['style-loader', 'css-loader'],
       },
       // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
       // { test: /\.(png|jpg|gif|webp|svg|zip)$/, loader: [{ loader: 'url-loader' }] }
       {
         test: /\.svg/,
         type: 'asset/inline',
       },
      ],
   },
   resolve: { extensions: ['.tsx', '.ts', '.jsx', '.js'] },
   output: {
      filename: (pathData) => {
        return pathData.chunk.name === 'code'
          ? 'code.js'
          : '[name].[contenthash].js';
      },
      path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
      // Clean the output directory before emit.
      clean: true,
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
   ]
});