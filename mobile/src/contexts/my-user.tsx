import { createContext, ReactNode, useContext } from 'react'
import { GraphQLTypes, useTypedQuery } from '../api'
import { useAuth } from './auth'

const MyUserContext = createContext({} as MyUserContextType)

export function useMyUser() {
	return useContext(MyUserContext)
}

export default function MyUserProvider({ children }: MyUserProviderProps) {
	const { isLoggedIn } = useAuth()

	const { data, refetch } = useTypedQuery(
		{ myUser: { id: true, fullName: true, image: true, role: true } },
		{ apolloOptions: { skip: !isLoggedIn } },
	)

	return (
		<MyUserContext.Provider
			value={{ myUser: data?.myUser, refetchMyUser: refetch }}
		>
			{children}
		</MyUserContext.Provider>
	)
}

type MyUserContextType = {
	myUser?: Pick<GraphQLTypes['User'], 'id' | 'fullName' | 'image' | 'role'>
	refetchMyUser: () => void
}

type MyUserProviderProps = {
	children: ReactNode
}
