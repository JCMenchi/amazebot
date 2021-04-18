const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './frontend/index.js',
  mode: "development",
  devtool: "source-map",
  module: {
    noParse: /jspdf.umd.min.js/,
    rules: [
      {
        test: /\-worker\.js$/,
        use: { loader: 'worker-loader',
        options: { inline:"fallback" },}
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|woff|woff2)$/,
        loader: "file-loader"
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "dist/"),
    publicPath: "/",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    historyApiFallback: true,
    port: 3000,
    publicPath: "http://localhost:3000/",
    hot: true,
    proxy: {
      '/api/players': 'http://localhost/',
      '/api/mazes': 'http://localhost/',
      '/api/games': 'http://localhost/',
    }
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin({verbose:true}), 
    new webpack.HotModuleReplacementPlugin()
  ]
};
