/**
 * @fileoverview Build HTML
 * @description This script compiles EJS templates into HTML files.
 */

require('dotenv').config();

if (process.env.BUILD_MODE === 'local') {
  process.env.CDN_URL = ''; // No CDN for local builds
}

const fs = require('fs-extra');
const path = require('path');
const ejs = require('ejs');
const glob = require('glob');

const srcDir = path.join(__dirname, '../src/views');
const destDir = path.join(__dirname, '../dist');

const files = glob.sync(`${srcDir}/**/*.ejs`);

files.forEach((file) => {
  const relativePath = path.relative(srcDir, file);
  const outPath = path.join(destDir, relativePath.replace(/\.ejs$/, '.html'));

  ejs.renderFile(file, { env: process.env }, {}, (err, str) => {
    if (err) {
      console.error(`Error rendering ${file}:`, err);
    } else {
      fs.outputFileSync(outPath, str);
      console.log(`Compiled ${file} -> ${outPath}`);
    }
  });
});
