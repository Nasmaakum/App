import {
	HStack,
	IInputProps,
	ITextProps,
	Input as NBInput,
	Skeleton,
	Text,
	useTheme,
	VStack,
} from 'native-base'
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack'
import Icon, { IconsType } from '../Icon'
import React, { useState } from 'react'

export default function Input(props: InputProps) {
	const {
		value,
		label,
		icon,
		containerStyle,
		labelStyle,
		isLoading,
		multiline,
		error,
		type,
		...rest
	} = props

	const theme = useTheme()

	const [showPassword, setShowPassword] = useState(false)

	if (isLoading)
		return (
			<VStack space='1'>
				{!!label && (
					<Skeleton
						w={2 * label.length}
						h='6'
						borderRadius='md'
						endColor='gray.300'
					/>
				)}

				<Skeleton w='full' h='12' borderRadius='lg' endColor='gray.300' />
			</VStack>
		)

	return (
		<VStack space='1' {...containerStyle}>
			{!!label && (
				<Text
					h='6'
					fontSize='md'
					color='primary.600'
					fontWeight='semibold'
					{...labelStyle}
				>
					{label}
				</Text>
			)}

			<HStack justifyContent='center' alignItems='center' space='1'>
				{icon && <Icon name={icon} size='2xl' color='primary.600' />}

				<NBInput
					borderColor='transparent'
					borderRadius='none'
					p='0'
					pt='1'
					pb='2'
					borderBottomColor='primary.600'
					borderBottomWidth='2'
					bg='white'
					flex={1}
					type={showPassword ? 'text' : type}
					rightElement={
						type === 'password' ? (
							<Icon
								name={showPassword ? 'EyeSolid' : 'EyeSlashSolid'}
								color='primary.600'
								onPress={() => setShowPassword(val => !val)}
							/>
						) : null
					}
					placeholderTextColor={theme.colors.primary[label ? 500 : 600]}
					_input={{
						fontSize: 'md',
						color: value ? 'gray.500' : 'primary.500',
						fontWeight: 'semibold',
					}}
					_focus={{
						borderColor: 'transparent',
						bg: 'transparent',
					}}
					value={value}
					multiline={multiline}
					{...rest}
				/>
			</HStack>

			<Text color='red.700' fontSize='xs' opacity={error ? 1 : 0}>
				{error || '.'}
			</Text>
		</VStack>
	)
}

Input.defaultProps = {
	disabled: false,
	isLoading: false,
} as Partial<InputProps>
interface InputProps extends IInputProps {
	icon?: IconsType
	isLoading?: boolean
	error?: string
	label?: string
	labelStyle?: ITextProps
	containerStyle: IVStackProps
}
