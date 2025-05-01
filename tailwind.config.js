module.exports = {
  content: [
    './src/views/**/*.ejs',
    './src/partials/**/*.ejs',
    './src/js/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
