const path = require("path"),
  mapValues = require("lodash/mapValues"),
  mapKeys = require("lodash/mapKeys"),
  map = require("lodash/map"),
  pickBy = require("lodash/pickBy"),
  isArray = require("lodash/isArray"),
  isObject = require("lodash/isArray"),
  isString = require("lodash/isString"),
  HtmlWebpackPlugin = require("html-webpack-plugin"),
  CleanWebpackPlugin = require("clean-webpack-plugin"),
  ExtractTextPlugin = require("extract-text-webpack-plugin"),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin"),
  webpack = require("webpack")

const cwd = process.cwd(),
  pkg = require(cwd + "/package.json"),
  defaultOutputPath = "dist"

console.log("config::", JSON.stringify(pkg.webpack, null, 2))
init(pkg)

module.exports = {
  devtool: "source-map",
  devServer: pkg.webpack.devServer,
  entry: pkg.webpack.entry,
  output: pkg.webpack.output,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        include: /(src)/,
        use: {
          loader: 'babel-loader',
          options: pkg.babel,
        }
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: "css-loader",
              options: {
                sourceMap: true,
              }
            }, {
              loader: "sass-loader",
              options: {
                outputStyle: 'compressed',
                sourceMap: true,
              }
            }]
        })
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(pkg.webpack.output.path),
    new webpack.HotModuleReplacementPlugin(),
    new ExtractTextPlugin({
      filename: "[hash].[name].css",
    }),
    ...pkg.webpack.html,
    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer'
    }),
    new CopyWebpackPlugin([
      {
        context: pkg.webpack.src || 'src',
        from: '**/*',
      },
    ], {
        ignore: [
          '*.js',
          '*.scss',
          '*.css',
          '*.html',
          '*.map',
        ],
      }),
    new CopyWebpackPlugin([
      {
        context: pkg.webpack.src || 'src',
        from: 'asset/**/*',
      },
    ])
  ]
}

function init(pkg) {
  pkg.webpack.html = html(pkg.webpack.entry)
  pkg.webpack.entry = entry(pkg.webpack.entry)
  pkg.webpack.output = output(pkg.webpack.output)
  pkg.webpack.devServer = devServer(pkg.webpack.devServer)
}

function entry(entries) {
  entries = pickBy(entries, (value, key) => {
    let ext = key.substr(key.lastIndexOf('.') + 1)
    return ext == "js" || ext == "css"
  })
  entries = mapValues(entries, value => path.resolve(cwd, value))
  return mapKeys(entries, (value, key) => key.replace(".js", ""))
}

function output(output) {
  return {
    filename: "[hash].[name].js",
    ...output,
    strictModuleExceptionHandling: true,
    path: path.resolve(cwd, output
      ? output.path
      : defaultOutputPath),
  }
}

function html(entries) {
  entries = pickBy(entries, (value, key) => "html" == value.substr(value.lastIndexOf('.') + 1))
  return map(entries, (value, key) => {
    return new HtmlWebpackPlugin({
      filename: key,
      template: value,
      inject: "head",
      chunks: [key.replace(".html", "")]
      //inject: false,
    })
  })
}

function devServer(devServer) {
  return {
    compress: true,
    port: 8080,
    ...devServer,
    contentBase: path.resolve(cwd, pkg.webpack.output
      ? pkg.webpack.output.path
      : defaultOutputPath),
  }
}