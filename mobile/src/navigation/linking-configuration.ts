import * as Linking from 'expo-linking'
import { LinkingOptions } from '@react-navigation/native'
import { RootStackParamList } from './types'

const LinkingConfiguration: LinkingOptions<RootStackParamList> = {
	prefixes: [Linking.createURL('/')],
	config: {
		screens: {
			HomeStack: {
				screens: {
					Home: '*',
				},
			},
		},
	},
}

export default LinkingConfiguration
