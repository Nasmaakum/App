import { _TransformValues, UseFormInput } from '@mantine/form/lib/types'
import { useEffect, useState } from 'react'
import { UseFormReturnType, useForm as useMantineForm } from '@mantine/form'
import { useRouter } from 'next/router'

type FormReturnType<
	Values,
	TransformValues extends _TransformValues<Values> = (values: Values) => Values,
> = UseFormReturnType<Values, TransformValues> & {
	allowNavigation: () => void
}

export default function useForm<
	Values,
	TransformValues extends _TransformValues<Values> = (values: Values) => Values,
>(
	formValues?: UseFormInput<Values, TransformValues>,
): FormReturnType<Values, TransformValues> {
	const router = useRouter()

	const [allowNavigation, setAllowNavigation] = useState(true)

	useEffect(() => {
		const warningText =
			'You have unsaved changes - are you sure you wish to leave this page?'

		const handleWindowClose = (e: BeforeUnloadEvent) => {
			if (allowNavigation) return

			e.preventDefault()
			return (e.returnValue = warningText)
		}

		const handleBrowseAway = () => {
			if (allowNavigation) return

			if (window.confirm(warningText)) return
			router.events.emit('routeChangeError')
			throw 'routeChange aborted.'
		}

		window.addEventListener('beforeunload', handleWindowClose)
		router.events.on('routeChangeStart', handleBrowseAway)

		return () => {
			window.removeEventListener('beforeunload', handleWindowClose)
			router.events.off('routeChangeStart', handleBrowseAway)
		}
	}, [allowNavigation])

	const { getInputProps, ...form } = useMantineForm<Values, TransformValues>(
		formValues,
	)

	return {
		...form,
		allowNavigation: () => setAllowNavigation(true),
		getInputProps: name => ({
			...getInputProps(name),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onChange: (event: any) => {
				setAllowNavigation(false)
				getInputProps(name).onChange(event)
			},
		}),
	}
}
