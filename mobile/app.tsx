import './src/utils/i18n/i18n'
import 'react-native-gesture-handler'
import { NativeBaseProvider } from 'native-base'
import { theme } from './src/constants/theme'
import AdvertisementsProvider from './src/providers/advertisements'
import APIProvider from './src/providers/api'
import AuthContext from './src/contexts/auth'
import MyUserContext from './src/contexts/my-user'
import Navigation from './src/navigation'
import React from 'react'
import useLoading from './src/hooks/useLoading'

const withProviders = (Component: React.FC) => () => {
	return (
		<NativeBaseProvider theme={theme} config={theme.config}>
			<AuthContext>
				<APIProvider>
					<MyUserContext>
						<Component />
					</MyUserContext>
				</APIProvider>
			</AuthContext>
		</NativeBaseProvider>
	)
}

function App() {
	const isLoadingComplete = useLoading()

	if (!isLoadingComplete) return null

	return (
		<AdvertisementsProvider>
			<Navigation />
		</AdvertisementsProvider>
	)
}

export default withProviders(App)
