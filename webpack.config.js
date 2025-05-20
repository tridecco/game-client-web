const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const webpack = require('webpack');

require('dotenv').config();

module.exports = {
  mode: 'production',
  entry: () => {
    const files = fs
      .readdirSync(path.resolve(__dirname, 'src', 'scripts'))
      .filter((file) => file.endsWith('.js'))
      .reduce((entries, file) => {
        entries[file] = path.resolve(__dirname, 'src', 'scripts', file);
        return entries;
      }, {});

    return files;
  },

  plugins: [
    new webpack.DefinePlugin({
      CDN_URL: JSON.stringify(process.env.CDN_URL),
      API_URL: JSON.stringify(process.env.API_URL),
    }),
  ],

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: (pathData) => {
      const name = pathData.chunk.name;
      return name === 'service-worker.js' ? 'service-worker.js' : `js/${name}`;
    },
    library: {
      type: 'global',
      name: '[name]',
    },
  },

  optimization: {
    minimizer: [
      ...(process.env.NODE_ENV === 'production'
        ? [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true,
                },
              },
              extractComments: false,
            }),
          ]
        : []),
    ],
  },
};
