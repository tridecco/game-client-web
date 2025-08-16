const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const webpack = require('webpack');

require('dotenv').config();

module.exports = {
  mode: 'production',
  entry: () => {
    function getAllJsFiles(dir, baseDir = dir) {
      const results = {};
      fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          Object.assign(results, getAllJsFiles(fullPath, baseDir));
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          const relPath = path.relative(baseDir, fullPath);
          results[relPath] = fullPath;
        }
      });
      return results;
    }
    const scriptsDir = path.resolve(__dirname, 'src', 'scripts');

    return getAllJsFiles(scriptsDir);
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
