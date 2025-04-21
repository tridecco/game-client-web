module.exports = {
  content: ['./src/views/**/*.ejs', './public/**/*.html', './public/**/*.js'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
