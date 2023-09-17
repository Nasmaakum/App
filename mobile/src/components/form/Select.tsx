/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	HStack,
	ISelectProps,
	Select as NBSelect,
	Skeleton,
	Text,
	useTheme,
	VStack,
} from 'native-base'
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack'
import Icon, { IconsType } from '../Icon'
import React from 'react'

export default function Select(props: Props) {
	const {
		defaultValue,
		selectedValue,
		label,
		data = [],
		icon,
		style,
		isLoading,
		isDisabled,
		error,
		...rest
	} = props

	const theme = useTheme()

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
		<VStack style={style} space='1'>
			{!!label && (
				<Text h='6' fontSize='md' color='primary.600' fontWeight='semibold'>
					{label}
				</Text>
			)}

			<HStack
				bg='white'
				justifyContent='center'
				alignItems='center'
				space='1'
				opacity={isDisabled || isLoading ? 0.35 : 1}
			>
				{icon && <Icon name={icon} size='2xl' color='primary.600' />}

				<NBSelect
					borderWidth={0}
					borderColor='transparent'
					borderBottomColor='primary.600'
					borderBottomWidth='2'
					borderRadius='none'
					flex={1}
					variant='unstyled'
					p='0'
					pt='1'
					placeholderTextColor={theme.colors.primary[label ? 500 : 600]}
					_text={{
						fontSize: 'md',
						color: 'primary.600',
						fontWeight: 'semibold',
					}}
					pb='2'
					dropdownIcon={
						<Icon
							name='ChevronDownSolid'
							mr='2'
							size='sm'
							color='primary.400'
						/>
					}
					fontSize='md'
					isDisabled={isDisabled}
					defaultValue={defaultValue as string}
					selectedValue={selectedValue as string}
					{...rest}
				>
					{data.map(({ ...item }) => (
						<NBSelect.Item key={item.value} {...item} />
					))}
				</NBSelect>
			</HStack>

			<Text color='red.700' fontSize='xs' opacity={error ? 1 : 0}>
				{error || 'error'}
			</Text>
		</VStack>
	)
}

Select.defaultProps = {
	disabled: false,
	isLoading: false,
	data: [],
} as Partial<Props>

interface Props
	extends Omit<ISelectProps, 'value' | 'defaultValue' | 'selectedValue'> {
	icon?: IconsType
	data: Array<{ label: string; value: string }>
	isLoading?: boolean
	error?: string
	label?: string
	style: IVStackProps['style']
	defaultValue?: string
	selectedValue?: string
}
