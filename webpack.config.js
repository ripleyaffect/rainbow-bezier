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
        include: __dirname + '/client'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.es6'],
    alias: {
      app: __dirname + '/client'
    }
  }
})