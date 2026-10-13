/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#8966FA',
        secondary: '#FFE100',
        ink: '#0A0116',
        lavender: '#D8CFFF',
        'lavender-deep': '#C9B8FF',
        muted: '#6B6575',
        field: '#F3F1F6',
        'field-border': '#E8E4EF',
      },
      fontSize: {
        heading: ['36px', { lineHeight: '42px', fontWeight: '800' }],
        title: ['20px', { lineHeight: '26px', fontWeight: '700' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
      },
      borderRadius: {
        sheet: '40px',
        field: '18px',
      },
      maxWidth: {
        auth: '480px',
      },
    },
  },
  plugins: [],
};
