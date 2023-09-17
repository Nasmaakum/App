const colors = {
	primary: {
		DEFAULT: '#FFE69B',
		50: '#FFF5D8',
		100: '#FFF0C4',
		200: '#FFE69B',
		300: '#FFD863',
		400: '#FFCA2B',
		500: '#F2B500',
		600: '#BA8B00',
		700: '#826100',
		800: '#493700',
		900: '#110D00',
	},
	secondary: {
		DEFAULT: '#F9ACAC',
		50: '#FFFFFF',
		100: '#FFFFFF',
		200: '#FFF8F8',
		300: '#FCD2D2',
		400: '#F9ACAC',
		500: '#F57878',
		600: '#F14343',
		700: '#EC1111',
		800: '#B70D0D',
		900: '#830909',
	},
	tertiary: {
		DEFAULT: '#1D315E',
		50: '#A2B6E2',
		100: '#92A9DD',
		200: '#7391D4',
		300: '#5478CA',
		400: '#3A62BC',
		500: '#30529C',
		600: '#27417D',
		700: '#1D315E',
		800: '#101B33',
		900: '#030408',
	},
}

/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			backgroundColor: colors,
			textColor: colors,
			colors: colors,
			transitionProperty: {
				height: 'height',
				width: 'width',
			},
			maxWidth: {
				'w-max-full': '100%',
			},
			minHeight: {
				12: '3rem',
				24: '6rem',
			},
			width: {
				18: '4.5rem',
			},
		},
	},
	plugins: [],
}
