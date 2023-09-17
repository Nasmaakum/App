import { useMyUser } from '../contexts/my-user'

export default function useIsInterpreter() {
	const { myUser } = useMyUser()

	return myUser?.role === 'INTERPRETER'
}
