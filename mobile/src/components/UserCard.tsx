// import { $, useTypedMutation } from '../api'
import {
	Avatar,
	Box,
	HStack,
	IImageProps,
	IPressableProps,
	Pressable,
	Text,
	VStack,
} from 'native-base'
// import { useApolloClient } from '../providers/api'
import { useMyUser } from '../contexts/my-user'
import Icon from './Icon'
import React from 'react'

export const UserCard = (props: UserCardProps) => {
	const {
		id,
		fullName,
		image,
		languages,
		isInterpreter,
		isFavorite,
		rating = null,
		isOnline,
		userId,
		disabled,
		isBusy,
		...rest
	} = props

	const { myUser } = useMyUser()
	// const { client } = useApolloClient()

	const isMyUser = userId === myUser?.id

	// const [toggleFavoriteInterpreter] = useTypedMutation(
	// 	{
	// 		toggleFavoriteInterpreter: [
	// 			{ where: $('where', 'InterpreterWhereUniqueInput!') },
	// 			true,
	// 		],
	// 	},
	// 	{ apolloOptions: { onCompleted: () => client.refetchQueries({ include: ["Interpreter", "HomeInterpreters"] }) } },
	// )

	return (
		<Pressable position='relative' disabled={disabled || isMyUser} {...rest}>
			<HStack
				bg='primary.50'
				p='4'
				borderRadius='3xl'
				space='md'
				alignItems='center'
				shadow='9'
				style={{ shadowOpacity: 0.15 }}
			>
				<Box position='relative'>
					<Avatar
						size='lg'
						source={
							image ? { uri: image } : require('../assets/images/user.png')
						}
					/>

					<Box
						h='4'
						w='4'
						bg={isOnline ? (isBusy ? 'amber.600' : 'green.600') : 'gray.600'}
						borderRadius='full'
						position='absolute'
						right={0}
					/>
				</Box>

				<VStack>
					<Text fontWeight='bold' color='primary.600' fontSize='md'>
						{fullName}
					</Text>

					{isInterpreter && !!languages.length && (
						<Text fontSize='md' fontWeight='semibold' color='gray.500'>
							{languages.join(' - ')}
						</Text>
					)}
				</VStack>
			</HStack>

			{isInterpreter && (
				<VStack
					justifyContent='space-between'
					position='absolute'
					top={0}
					bottom={0}
					right={0}
					px='6'
					py='2'
					alignItems='flex-end'
				>
					{rating !== null && (
						<HStack>
							{Array(5)
								.fill(0)
								.map((_, index) => (
									<Icon
										key={index}
										name='StarSolid'
										color={rating > index ? 'primary.500' : 'gray.400'}
										size='sm'
									/>
								))}
						</HStack>
					)}

					{/* {!isMyUser && (
						<Icon
							name={isFavorite ? 'HeartSolid' : 'HeartRegular'}
							color='red.600'
							size='md'
							pressableProps={{ hitSlop: 4 }}
							onPress={() =>
								toggleFavoriteInterpreter({ variables: { where: { id } } })
							}
						/>
					)} */}
				</VStack>
			)}

			<Box
				position='absolute'
				justifyContent='center'
				top='0'
				bottom='0'
				left={-4}
			>
				<Box borderRadius='full' w='2' bg='primary.600' h='10' />
			</Box>
		</Pressable>
	)
}

interface UserCardProps extends IPressableProps {
	id: string
	userId?: string
	fullName: string
	image?: IImageProps['source'] | string
	rating?: number | null
	languages?: string[]
	isFavorite?: boolean
	isOnline?: boolean
	isBusy?: boolean
	isInterpreter?: boolean
}
