import { HStack, IButtonProps, Button as NBButton, Text } from 'native-base'
import Icon, { IconsType } from '../Icon'
import React from 'react'

export default function Button(props: ButtonProps) {
	const { children, colorScheme, variant, icon, _text, ...rest } = props

	return (
		<NBButton
			colorScheme={colorScheme}
			bg={
				!colorScheme && (variant === 'solid' || !variant)
					? 'primary.600'
					: undefined
			}
			borderColor={variant === 'outline' ? 'primary.300' : 'transparent'}
			borderWidth={2}
			variant={variant}
			borderRadius='full'
			h='16'
			_text={{ fontWeight: 'bold', fontSize: 'lg' }}
			{...rest}
		>
			<HStack space='sm'>
				{!!icon && <Icon name={icon} color='white' />}

				<Text fontWeight='bold' fontSize='lg' color='white' {..._text}>
					{children}
				</Text>
			</HStack>
		</NBButton>
	)
}

interface ButtonProps extends IButtonProps {
	children: React.ReactNode
	icon?: IconsType
}
