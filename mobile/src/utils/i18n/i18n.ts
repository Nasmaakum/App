import { I18nManager } from 'react-native'
import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import RNRestart from 'react-native-restart'

import auth from './resources/auth'
import common from './resources/common'
import home from './resources/home'
import information from './resources/information'
import interpreter from './resources/interpreter'
import settings from './resources/settings'
import user from './resources/user'

const resources = {
	en: {
		auth: auth.en,
		common: common.en,
		home: home.en,
		interpreter: interpreter.en,
		settings: settings.en,
		user: user.en,
		information: information.en,
	},
	ar: {
		auth: auth.ar,
		common: common.ar,
		home: home.ar,
		interpreter: interpreter.ar,
		settings: settings.ar,
		user: user.ar,
		information: information.ar,
	},
}

i18n.use(initReactI18next).init({
	compatibilityJSON: 'v3',
	resources,
	lng: I18nManager.isRTL ? 'ar' : 'en',
	fallbackLng: 'ar',
	supportedLngs: ['en', 'ar'],
	interpolation: { escapeValue: false },
	defaultNS: 'common',
})

export const switchLanguage = () => {
	const isRTL = I18nManager.isRTL
	i18n.changeLanguage(isRTL ? 'en' : 'ar')
	I18nManager.forceRTL(!isRTL)
	RNRestart.Restart()
}

declare module 'i18next' {
	interface CustomTypeOptions {
		defaultNS: Namespace
		resources: (typeof resources)['en']
	}
}

export default i18n
