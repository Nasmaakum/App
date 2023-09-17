import { HStack, Text, VStack } from 'native-base'
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack'
import { useTranslation } from 'react-i18next'
import Icon from './Icon'
import React, { useMemo } from 'react'

const Section = (props: SectionProps) => {
	const { title, match } = props

	return (
		<HStack space='xs' alignItems='center'>
			<Icon
				name={match ? 'CheckSolid' : 'XSolid'}
				color={match ? 'green.400' : 'red.400'}
				size='sm'
			/>

			<Text fontSize='sm' color='gray.500' textAlign='center'>
				{title}
			</Text>
		</HStack>
	)
}

interface SectionProps {
	title: string
	match: boolean
}

export const PasswordRequirements = (props: PasswordRequirementsProps) => {
	const { password, ...rest } = props

	const { t } = useTranslation('common')

	const lengthMatch = useMemo(() => password?.length >= 6, [password])
	const uppercaseMatch = useMemo(() => /[A-Z]/.test(password || ''), [password])
	const lowercaseMatch = useMemo(() => /[a-z]/.test(password || ''), [password])
	const numericMatch = useMemo(() => /[0-9]/.test(password || ''), [password])
	const specialMatch = useMemo(
		() => /[!@#$%^&*(),.?":{}|<>]/.test(password || ''),
		[password],
	)

	return (
		<VStack space='md' {...rest}>
			<Section title={t('6-characters-or-more')} match={lengthMatch} />
			<Section title={t('uppercase-letter')} match={uppercaseMatch} />
			<Section title={t('lowercase-letter')} match={lowercaseMatch} />
			<Section title={t('special-character')} match={specialMatch} />
			<Section title={t('numeric-character')} match={numericMatch} />
		</VStack>
	)
}

interface PasswordRequirementsProps extends IVStackProps {
	password?: string
}
