import * as SplashScreen from 'expo-splash-screen'
import { useAuth } from '../contexts/auth'
import { useEffect, useState } from 'react'

export default function useLoading() {
	const [isLoadingComplete, setLoadingComplete] = useState(false)

	const { loadingCompleted } = useAuth()

	useEffect(() => {
		async function loading() {
			if (!loadingCompleted) {
				await SplashScreen.preventAutoHideAsync()
				return
			}

			await SplashScreen.hideAsync()
			setLoadingComplete(true)
		}

		loading()
	}, [loadingCompleted])

	return isLoadingComplete
}
