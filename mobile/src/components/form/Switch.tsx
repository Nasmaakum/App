import { Box, HStack, Pressable, Text } from 'native-base'
import { IHStackProps } from 'native-base/lib/typescript/components/primitives/Stack/HStack'
import Icon, { IconsType } from '../Icon'
import React from 'react'

export default function Switch(props: SwitchProps) {
	const { label, icon, style, onPress, isChecked, isDisabled } = props

	return (
		<HStack style={style} alignItems='center'>
			{icon && <Icon name={icon} color='primary.400' size='2xl' />}

			<Text
				h='6'
				fontSize='md'
				color='primary.600'
				fontWeight='semibold'
				flex={1}
			>
				{label}
			</Text>

			<Pressable isDisabled={isDisabled} onPress={onPress}>
				<HStack
					w='16'
					borderRadius='full'
					h='8'
					bg={
						isChecked ? (!isDisabled ? 'primary.600' : 'gray.200') : 'gray.200'
					}
					alignItems='center'
					justifyContent={isChecked ? 'flex-end' : 'flex-start'}
					p='1'
				>
					<Box bg='white' h='6' w='6' borderRadius='full' />
				</HStack>
			</Pressable>
		</HStack>
	)
}

Switch.defaultProps = {
	disabled: false,
	loading: false,
} as Partial<SwitchProps>

interface SwitchProps {
	label: string
	style: IHStackProps['style']
	icon?: IconsType
	onPress: () => void
	isChecked?: boolean
	isDisabled?: boolean
}
