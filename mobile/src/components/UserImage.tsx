import * as ImagePicker from 'expo-image-picker'
import * as mime from 'react-native-mime-types'
import { Actionsheet, Avatar, Box, HStack, Pressable } from 'native-base'
import { ReactNativeFile } from 'apollo-upload-client'
import { useTranslation } from 'react-i18next'
import Icon from './Icon'
import React, { useState } from 'react'

export const UserImage = (props: UserImageProps) => {
	const { image, isDisabled, setImage } = props

	const { t } = useTranslation('user')

	const [showSelectSource, setShowSelectSource] = useState(false)
	const [userImage, setUserImage] = useState(
		image ? { uri: image } : require('../assets/images/user.png'),
	)

	const pickImage = async (camera: boolean) => {
		setShowSelectSource(false)
		const result = camera
			? await ImagePicker.launchCameraAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.5,
			  })
			: await ImagePicker.launchImageLibraryAsync({
					mediaTypes: ImagePicker.MediaTypeOptions.Images,
					allowsEditing: true,
					aspect: [1, 1],
					quality: 0.5,
			  })

		if (result.canceled) return

		const asset = result.assets[0]
		const uri = asset.uri

		setUserImage({ uri })

		const file = new ReactNativeFile({
			uri: uri,
			type: mime.lookup(uri) || 'image',
			name: uri,
		})

		setImage(file)
	}

	return (
		<>
			<HStack justifyContent='center'>
				<Box position='relative'>
					<HStack
						bg='primary.50'
						p='2'
						borderRadius='3xl'
						space='md'
						alignItems='center'
						shadow='9'
						style={{ shadowOpacity: 0.15 }}
						px='10'
					>
						<Box position='relative'>
							<Pressable
								position='relative'
								isDisabled={isDisabled}
								onPress={() => setShowSelectSource(true)}
							>
								{({ isPressed }) => (
									<Box position='relative' opacity={isPressed ? 0.5 : 1}>
										<Avatar size='2xl' source={userImage} />

										<Box
											position='absolute'
											borderRadius='full'
											top='0'
											left='0'
											right='0'
											bottom='0'
											justifyContent='center'
											alignItems='center'
											overflow='hidden'
										>
											<Box
												opacity={0.2}
												top='0'
												left='0'
												bg='black'
												right='0'
												bottom='0'
												position='absolute'
											/>
											<Icon
												name='ArrowsRotateSolid'
												color='white'
												size='3xl'
												opacity={0.8}
											/>
										</Box>
									</Box>
								)}
							</Pressable>

							<Box
								h='6'
								w='6'
								bg='green.600'
								borderRadius='full'
								position='absolute'
								right={2}
								top={2}
							/>
						</Box>
					</HStack>

					<Box
						position='absolute'
						justifyContent='center'
						top='0'
						bottom='0'
						left={-6}
					>
						<Box borderRadius='full' w='3' bg='primary.600' h='16' />
					</Box>
				</Box>
			</HStack>
			<Actionsheet
				isOpen={showSelectSource}
				onClose={() => setShowSelectSource(false)}
			>
				<Actionsheet.Content>
					<Actionsheet.Item
						leftIcon={<Icon name='CameraSolid' />}
						onPress={() => pickImage(true)}
					>
						{t('camera')}
					</Actionsheet.Item>
					<Actionsheet.Item
						leftIcon={<Icon name='ImageSolid' />}
						onPress={() => pickImage(false)}
					>
						{t('select-image')}
					</Actionsheet.Item>

					{!!image && (
						<Actionsheet.Item
							leftIcon={<Icon name='XmarkSolid' color='red.400' />}
							onPress={() => {
								setUserImage(require('../assets/images/user.png'))
								setImage(null)
								setShowSelectSource(false)
							}}
						>
							{t('remove-image')}
						</Actionsheet.Item>
					)}
				</Actionsheet.Content>
			</Actionsheet>
		</>
	)
}

interface UserImageProps {
	image?: string
	setImage: (image: ReactNativeFile) => void
	isDisabled?: boolean
}
