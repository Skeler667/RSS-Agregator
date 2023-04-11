import * as path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// const mode = process.env.NODE_ENV;
const mode = 'development';

const stylesHandler = MiniCssExtractPlugin.loader;

const config = {
  performance: {
    hints: false,
  },
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

  ],

  module: {

    rules: [

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
    ],
  },
};

export default {
  ...config,
  mode,
};
