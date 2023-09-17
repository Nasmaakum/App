import {
	AspectRatio,
	Box,
	HStack,
	IPressableProps,
	Pressable,
	Skeleton,
	Text,
} from 'native-base'
import { Maybe } from 'api/src/gql-types'
import Icon from '../Icon'
import React from 'react'

export default function Checkbox(props: Props) {
	const {
		title,
		description,
		isChecked,
		style,
		isDisabled,
		isLoading,
		isToggle = false,
		error,
		...rest
	} = props

	if (isLoading)
		return (
			<HStack space={1}>
				<Skeleton w={6} h={6} endColor='gray.300' borderRadius='sm' />
				{typeof title === 'string' && (
					<Skeleton
						w={2 * title.length}
						h={6}
						endColor='gray.300'
						borderRadius='sm'
					/>
				)}
			</HStack>
		)

	return (
		<Pressable
			isDisabled={isDisabled || isLoading || (isChecked && !isToggle)}
			hitSlop={8}
			{...rest}
		>
			{({ isPressed }) => (
				<HStack opacity={isPressed ? 0.3 : 1} space='sm'>
					<AspectRatio ratio={1}>
						<Box
							borderWidth={1.5}
							borderRadius='md'
							borderColor='primary.600'
							alignItems='center'
							justifyContent='center'
							bg='white'
						>
							<Icon
								name='CheckSolid'
								size='sm'
								color='primary.600'
								opacity={isChecked ? 1 : 0}
							/>
						</Box>
					</AspectRatio>

					<HStack flex={1} space={1} alignItems='center'>
						{typeof title === 'string' ? (
							<Text
								fontWeight='semibold'
								fontSize='sm'
								color={error ? 'red.600' : 'primary.600'}
							>
								{title}
							</Text>
						) : (
							title
						)}

						{!!description && <Text>({description})</Text>}
					</HStack>
				</HStack>
			)}
		</Pressable>
	)
}

Checkbox.defaultProps = {
	isChecked: false,
	isLoading: false,
} as Partial<Props>

interface Props extends IPressableProps {
	title: string | React.ReactNode
	description?: Maybe<string>
	isChecked: boolean
	isToggle: boolean
	isLoading?: boolean
	error?: boolean
}
