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
                // Custom Neon Highlights
                'neon-blue': '#4361EE',
                'neon-cyan': '#4CC9F0',
                'neon-violet': '#7209B7',
                'neon-fuchsia': '#F72585',

                // Functional semantic colors
                success: {
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                },
                warning: {
                    400: '#fbbf24',
                    500: '#f59e0b',
                    600: '#d97706',
                },
                danger: {
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                },
                secondary: '#7012ce', // For the settings page title part
            },
            boxShadow: {
                'glow-sm': '0 0 10px rgba(67, 97, 238, 0.2)',
                'glow-md': '0 0 20px rgba(67, 97, 238, 0.3)',
                'glow-lg': '0 0 30px rgba(67, 97, 238, 0.4)',
                'glow-violet': '0 0 25px rgba(114, 9, 183, 0.5)',
                'glow-indigo': '0 0 25px rgba(67, 97, 238, 0.5)',
                'glow-cyan': '0 0 25px rgba(76, 201, 240, 0.5)',
                'neon-border': '0 0 15px rgba(76, 201, 240, 0.2)',
                'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), 0 0 20px rgba(67, 97, 238, 0.3)',
            },
            animation: {
                'breathe-slow': 'breathe 8s ease-in-out infinite',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                breathe: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' }
                }
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
