import { extendTheme } from 'native-base'
import { I18nManager } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

export const theme = extendTheme({
	// fonts: {
	// 	heading: 'Janna LT',
	// 	body: 'Janna LT',
	// 	mono: 'Janna LT',
	// },
	components: {
		Input: {
			baseStyle: {
				input: { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' },
			},
		},
		Text: { baseStyle: { textAlign: 'left' } },
		Heading: { baseStyle: { textAlign: 'left' } },
	},
	colors: {
		primary: {
			50: '#e2eef6',
			100: '#b7e2f9',
			200: '#8dcef0',
			300: '#63bae9',
			400: '#3aa6e1',
			500: '#238cc8',
			600: '#166d9c',
			700: '#0a4e71',
			800: '#002f46',
			900: '#00121c',
		},
		transparent: 'transparent',
	},
	config: {
		initialColorMode: 'light',
		dependencies: { 'linear-gradient': LinearGradient },
	},
})

type CustomThemeType = typeof theme

declare module 'native-base' {
	interface ICustomTheme extends CustomThemeType {}
}
