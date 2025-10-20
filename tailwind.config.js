/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8F9FA',
        text: '#1C1C1E',
        mutedText: '#8E8E93',
        primary: '#007AFF',
        danger: '#FF3B30',
        warning: '#FF9500',
        success: '#34C759',
        card: '#FFFFFF',
        border: '#E5E5EA',
      },
    },
  },
  plugins: [],
}
