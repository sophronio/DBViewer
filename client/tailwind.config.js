const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
    purge: ['./src/**/*.{js,jsx}', './public/index.html'],
    darkMode: 'class', // or 'media' or 'class'
    theme: {
        fontFamily: {
            sans: ['IBM Plex Sans', ...fontFamily.sans],
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
