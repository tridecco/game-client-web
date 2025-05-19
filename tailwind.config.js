module.exports = {
  content: [
    './src/views/**/*.ejs',
    './src/partials/**/*.ejs',
    './src/scripts/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
