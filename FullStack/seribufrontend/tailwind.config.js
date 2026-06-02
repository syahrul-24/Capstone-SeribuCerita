/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary:        '#739caf',
        'primary-dark': '#4a7c8f',
        'primary-light':'rgba(115,156,175,0.12)',
        mint:    '#6BCB77',
        sky:     '#4D96FF',
        peach:   '#FF9F6B',
        yellow:  '#FFD93D',
        cream:   '#FFF8F0',
        teal:    '#EEF4F7',
        ink:     '#1A1A2E',
        'ink-soft':  '#3D3D5C',
        'ink-muted': '#7B7B9A',
      },
      fontFamily: {
        heading: ['"Fraunces"', 'serif'],
        body:    ['"Nunito"', 'sans-serif'],
        sans:    ['"Nunito"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '20px', '3xl': '28px', '4xl': '36px',
      },
      boxShadow: {
        'card':       '0 8px 32px rgba(26,26,46,0.08)',
        'card-hover': '0 16px 48px rgba(26,26,46,0.14)',
        'brand':      '0 8px 24px rgba(115,156,175,0.35)',
      },
    },
  },
  plugins: [],
}
