import {
	createContext,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = createContext({} as AuthContextType)

export function useAuth() {
	return useContext(AuthContext)
}

export default function AuthProvider({ children }: AuthProviderProps) {
	const [token, setToken] = useState<string>()
	const [loadingCompleted, setLoadingCompleted] = useState(false)

	useEffect(() => {
		AsyncStorage.getItem('token')
			.then(token => {
				if (token) setToken(token)
			})
			.finally(() => {
				setLoadingCompleted(true)
			})
	}, [])

	const logout = async () => {
		setToken(undefined)
		await AsyncStorage.clear()
	}

	const login = async (token: string) => {
		setToken(token)
		await AsyncStorage.setItem('token', token)
	}

	return (
		<AuthContext.Provider
			value={{ token, isLoggedIn: !!token, logout, login, loadingCompleted }}
		>
			{children}
		</AuthContext.Provider>
	)
}

type AuthContextType = {
	token?: string
	isLoggedIn?: boolean | null
	loadingCompleted: boolean
	logout: () => Promise<void>
	login: (token: string) => Promise<void>
}

type AuthProviderProps = {
	children: ReactNode
}
