import * as path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

const mode = process.env.NODE_ENV;

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  
  // entry: './src/index.js',
  // output: {
  //   path: path.resolve('dist'),
  // },
  devServer: {
    open: true,
    host: 'localhost',
  },
  output: {
    path: path.resolve('public'),
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
    }),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  // module: {
  //   rules: [
  //     {
  //       test: /\.css$/,
  //       use: ['style-loader', 'css-loader']
  //     }
  //   ]
  // }

  
  module: {
    rules: [
      // {
      //   test: /\.css$/,
      //   use: ['style-loader', 'css-loader']
      // },
      {
        test: /\.css$/,
        use: [stylesHandler, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/,
        use: [stylesHandler, 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};

export default {
  ...config,
  mode,
};

