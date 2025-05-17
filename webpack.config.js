const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');

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

  output: {
    path: path.resolve(__dirname, 'dist/js'),
    filename: '[name]',
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
