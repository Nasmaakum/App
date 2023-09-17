import {
	HStack,
	ITextProps,
	Pressable,
	Skeleton,
	Text,
	VStack,
} from 'native-base'
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack'
import dayjs from 'dayjs'
import Icon, { IconsType } from '../Icon'
import React, { useState } from 'react'
import RNDatePicker, {
	DatePickerProps as RNDatePickerProps,
} from 'react-native-date-picker'

export default function DatePicker(props: DatePickerProps) {
	const {
		label,
		icon,
		containerStyle,
		labelStyle,
		isLoading,
		placeholder,
		isDisabled,
		error,
		value,
		onChange,
		...rest
	} = props

	const [open, setOpen] = useState(false)

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

				<Pressable
					flex={1}
					borderRadius='none'
					p='0'
					pt='1'
					borderBottomWidth='2'
					borderBottomColor='primary.600'
					overflow='hidden'
					position='relative'
					opacity={isDisabled || isLoading ? 0.35 : 1}
					onPress={() => setOpen(true)}
				>
					<RNDatePicker
						open={open}
						date={dayjs(value).toDate()}
						mode='date'
						modal
						onConfirm={date => {
							setOpen(false)
							onChange(dayjs(date).toISOString())
						}}
						onCancel={() => setOpen(false)}
						{...rest}
					/>

					<Text
						fontSize='md'
						color={value ? 'gray.500' : 'primary.500'}
						flex={1}
					>
						{value ? dayjs(value).format('DD/MM/YYYY') : placeholder}
					</Text>
				</Pressable>
			</HStack>

			<Text color='red.700' fontSize='xs' opacity={error ? 1 : 0}>
				{error || '.'}
			</Text>
		</VStack>
	)
}

DatePicker.defaultProps = {
	disabled: false,
	isLoading: false,
} as Partial<DatePickerProps>
interface DatePickerProps extends RNDatePickerProps {
	icon?: IconsType
	isLoading?: boolean
	isDisabled?: boolean
	error?: string
	label?: string
	labelStyle?: ITextProps
	containerStyle: IVStackProps
	value?: Date
	placeholder?: string
	onChange?: (value: string) => void
}
