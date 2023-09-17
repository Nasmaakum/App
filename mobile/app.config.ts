import 'dotenv/config'
import { ExpoConfig } from '@expo/config-types'
import packageJSON from './package.json'

const env = {
	DEV_API_URL: process.env.DEV_API_URL,
	API_URL: process.env.API_URL,
	APP_VERSION: packageJSON.version,
	BUNDLE_IDENTIFIER: process.env.BUNDLE_IDENTIFIER,
	APPLE_APP_ID: process.env.APPLE_APP_ID,
	HUAWEI_APP_URL: process.env.HUAWEI_APP_URL,
	RATE_FALLBACK_URL: process.env.RATE_FALLBACK_URL,
}

declare module 'expo-constants' {
	interface Constants {
		expoConfig: ExpoConfig & {
			extra: typeof env
		}
	}
}

const expoConfig: ExpoConfig = {
	name: 'Nasmaakum',
	slug: 'nasmaakum',
	owner: 'invitacompany',
	version: packageJSON.version,
	orientation: 'portrait',
	icon: './src/assets/images/icon.png',
	scheme: 'nasmaakum',
	userInterfaceStyle: 'light',
	splash: {
		image: './src/assets/images/splash.png',
		resizeMode: 'contain',
		backgroundColor: '#ffffff',
	},
	updates: {
		fallbackToCacheTimeout: 60000,
		url: 'https://u.expo.dev/21db3f76-a49c-4a4d-94aa-68c90d1d254b',
		enabled: true,
	},
	runtimeVersion: '1.0.0',
	assetBundlePatterns: ['**/*'],
	ios: {
		supportsTablet: false,
		bundleIdentifier: 'com.invitabpo.nasmaakum',
		buildNumber: packageJSON.version,
		config: {
			usesNonExemptEncryption: false,
		},
	},
	android: {
		permissions: ['RECEIVE_BOOT_COMPLETED'],
		adaptiveIcon: {
			foregroundImage: './src/assets/images/adaptive-icon.png',
			backgroundColor: '#4595bf',
		},
		package: 'com.invitabpo.nasmaakum',
		googleServicesFile: './google-services.json',
		versionCode: parseInt(packageJSON.version.replace(/\./g, '')),
	},
	plugins: [
		['expo-notifications', { icon: './src/assets/images/notification.png' }],
		[
			'expo-image-picker',
			{
				photosPermission:
					'The app accesses your photos to let you set your profile image.',
				cameraPermission:
					'The app accesses your camera to let you take a profile image.',
			},
		],
	],
	extra: {
		...env,
		eas: {
			projectId: '21db3f76-a49c-4a4d-94aa-68c90d1d254b',
		},
	},
}

export default expoConfig
