module.exports = {
  entry: [
    './demo/main.js'
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/demo',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devtool: 'source-map', // I've tried every option
  devServer: {
    contentBase: './demo'
  }
}
