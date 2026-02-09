/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Deep charcoal backgrounds
                charcoal: {
                    950: '#0B0E14',
                    900: '#0F1220',
                    850: '#151923',
                    800: '#1a1f2e',
                },
                // Premium enterprise violet/indigo palette
                primary: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                },
                breathe: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' }
                }
            },
            boxShadow: {
                'glow-sm': '0 0 10px rgba(167, 139, 250, 0.2)',
                'glow-md': '0 0 20px rgba(167, 139, 250, 0.3)',
                'glow-lg': '0 0 30px rgba(167, 139, 250, 0.4)',
                'glow-violet': '0 0 25px rgba(167, 139, 250, 0.5)',
                'glow-indigo': '0 0 25px rgba(129, 140, 248, 0.5)',
                'glow-cyan': '0 0 25px rgba(103, 232, 249, 0.5)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), 0 0 20px rgba(167, 139, 250, 0.3)',
            },
            backdropBlur: {
                xs: '2px',
            },
            borderRadius: {
                'card': '16px',
            }
        },
    },
    plugins: [],
}
