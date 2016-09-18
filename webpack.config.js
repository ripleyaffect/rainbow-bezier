var nodeExternals = require('webpack-node-externals');

module.exports = (config) => ({
  entry: './client/index.js',
  output: {
    path: __dirname + '/public',
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.(es6|jsx?)$/,
        loader: 'babel',
        include: [
          __dirname + '/client',
          __dirname + '/shared'
        ],
        // exclude: [/node_modules/],
        query: {
          presets: [
            ['es2015', { modules: false }],
            'stage-0',
            'react',
          ]
        }
      },
      {
        test: /\.json$/,
        loader: 'json',
        include: [
          __dirname + '/client',
          __dirname + '/shared',
          __dirname + '/node_modules'
        ]
      },
      {
        test: /\.css$/,
        loader: 'style!css'
      },
      {
        test: /\.png$/,
        loader: 'url',
        query: {
          mimetype: 'image/png'
        }
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.es6'],
    alias: {
      app: __dirname
    }
  },
})