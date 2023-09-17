import {
	HStack,
	IInputProps,
	Input,
	ITextProps,
	Select,
	Skeleton,
	Text,
	VStack,
} from 'native-base'
import { I18nManager } from 'react-native'
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack'
import flags from '../../constants/flags.json'
import Icon, { IconsType } from '../Icon'
import parsePhoneNumber, { isValidPhoneNumber } from 'libphonenumber-js/min'
import React, { useEffect, useState } from 'react'

export default function PhoneInput(props: PhoneInputProps) {
	const {
		value,
		label,
		labelStyle,
		containerStyle,
		icon,
		isLoading,
		isDisabled,
		error,
		onChangeText,
		...rest
	} = props

	const [extension, setExtension] = useState<undefined | string>(undefined)
	const [extensionSearch, setExtensionSearch] = useState('')
	const [listOpen, setListOpen] = useState(false)

	const isValid = value ? isValidPhoneNumber(value as string) : true

	useEffect(() => {
		if (!value) {
			onChangeText?.('')
			setExtension('973')

			return
		}

		const phoneNumber = parsePhoneNumber(value as string)

		if (!phoneNumber) {
			onChangeText?.(`+973${value}`)
			setExtension('973')

			return
		}

		setExtension(phoneNumber.countryCallingCode)
	}, [isLoading])

	if (isLoading || !extension)
		return (
			<VStack space='1'>
				{!!label && (
					<Skeleton
						w={2 * label.length}
						h='5'
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

				<HStack
					flex={1}
					borderRadius='none'
					p='0'
					pt='1'
					borderBottomWidth='2'
					borderBottomColor={isValid ? 'primary.600' : 'red.600'}
					overflow='hidden'
					alignItems='center'
					opacity={isDisabled || isLoading ? 0.35 : 1}
					flexDir={I18nManager.isRTL ? 'row-reverse' : 'row'}
				>
					<Select
						borderWidth={0}
						variant='unstyled'
						dropdownIcon={
							<Icon name='ChevronDownSolid' size='sm' color='primary.600' />
						}
						_actionSheetBody={{
							ListHeaderComponent: (
								<Input
									placeholder='Search'
									value={extensionSearch}
									_input={{ fontSize: 'sm' }}
									onChangeText={setExtensionSearch}
								/>
							),
						}}
						fontSize='md'
						isDisabled={isDisabled}
						defaultValue={extension}
						selectedValue={extension}
						flex={1}
						_selectedItem={{
							bg: 'gray.200',
						}}
						onClose={() => setListOpen(false)}
						onOpen={() => setListOpen(true)}
						onValueChange={extn => {
							onChangeText?.(
								(value as string).replace(`+${extension}`, `+${extn}`),
							)
							setListOpen(false)
							setExtensionSearch('')
							setExtension(extn)
						}}
					>
						{flags
							.filter(({ code, country }) => {
								if (!extensionSearch) return true

								return (
									code.includes(extensionSearch.toLowerCase()) ||
									country.toLowerCase().includes(extensionSearch.toLowerCase())
								)
							})
							.map(({ code, flag, country }) => (
								<Select.Item
									key={code}
									label={
										listOpen
											? `${flag}  ${country} (+${code})`
											: `${flag} (+${code})`
									}
									value={code}
								/>
							))}
					</Select>

					<Input
						flex={1}
						keyboardType='phone-pad'
						borderWidth={0}
						bg='transparent'
						_focus={{ bg: 'transparent' }}
						h='full'
						_input={{ fontSize: 'md' }}
						value={(value as string).replace(`+${extension}`, '')}
						onChangeText={text => onChangeText?.(`+${extension}${text}`)}
						{...rest}
					/>
				</HStack>
			</HStack>

			<Text color='red.700' fontSize='xs' opacity={error ? 1 : 0}>
				{error || '.'}
			</Text>
		</VStack>
	)
}

PhoneInput.defaultProps = {
	disabled: false,
	isLoading: false,
} as Partial<PhoneInputProps>

interface PhoneInputProps extends IInputProps {
	icon?: IconsType
	isLoading?: boolean
	error?: string
	label?: string
	containerStyle: IVStackProps
	labelStyle?: ITextProps
	isDisabled?: boolean
}
