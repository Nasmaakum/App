import { HStack } from 'native-base'
import { Pill, PillProps } from './Pill'
import React from 'react'

export const PillTabs = (props: PillTabsProps) => {
	const { pills } = props

	return (
		<HStack
			bg='white'
			shadow='9'
			borderRadius='full'
			height='20'
			alignItems='center'
			space='md'
			p='4'
		>
			{pills.map(pill => (
				<Pill key={`pill_${pill.label}`} {...pill} />
			))}
		</HStack>
	)
}

interface PillTabsProps {
	pills: [PillProps, PillProps, PillProps?]
}
