import {
	Box,
	HStack,
	IPressableProps,
	ITextProps,
	Pressable,
	Text,
} from 'native-base'
import Icon, { IconsType } from './Icon'
import React from 'react'

export const Pill = (props: PillProps) => {
	const { icon, active, label, lowShadow, fontSize, ...rest } = props

	return (
		<Pressable
			flex={1}
			{...rest}
			disabled={active}
			shadow={lowShadow ? '2' : '9'}
		>
			<Box
				bg={
					active
						? {
								linearGradient: {
									colors: ['primary.600', 'primary.300'],
									start: [0, 0],
									end: [1, 0],
								},
						  }
						: 'white'
				}
				flex={1}
				borderRadius='full'
			>
				<HStack flex={1} space='sm' justifyContent='center' alignItems='center'>
					{!!icon && (
						<Icon name={icon} color={active ? 'white' : 'primary.600'} />
					)}

					<Text
						fontWeight='semibold'
						fontSize={fontSize || 'sm'}
						color={active ? 'white' : 'primary.600'}
					>
						{label}
					</Text>
				</HStack>
			</Box>
		</Pressable>
	)
}

export interface PillProps extends IPressableProps {
	label: string
	icon?: IconsType
	active: boolean
	lowShadow?: boolean
	fontSize?: ITextProps['fontSize']
}
