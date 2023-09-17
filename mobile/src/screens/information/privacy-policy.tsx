import { $, useTypedMutation, useTypedQuery } from '../../api'
import { I18nManager } from 'react-native'
import { RootStackScreenProps } from '../../navigation/types'
import { Section } from '../../components/layout/Section'
import { Text, useToast } from 'native-base'
import { useTranslation } from 'react-i18next'
import Button from '../../components/form/Button'
import Icon from '../../components/Icon'
import React, { useEffect, useState } from 'react'
import ScrollView from '../../components/layout/ScrollView'

export default function PrivacyPolicyScreen({
	route: { params },
	navigation,
}: RootStackScreenProps<'PrivacyPolicy'>) {
	const toast = useToast()

	const { t } = useTranslation('information')

	const [accepted, setAccepted] = useState(false)

	const { data, loading } = useTypedQuery({
		latestPrivacyPolicy: {
			id: true,
			content: true,
			version: true,
		},
	})

	const [acceptPrivacyPolicy, { loading: acceptPrivacyPolicyLoading }] =
		useTypedMutation(
			{
				acceptPrivacyPolicy: [
					{ where: $('where', 'PrivacyPolicyWhereInput!') },
					{ id: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						setAccepted(true)
						toast.show({ description: t('privacy-policy-accepted') })
					},
					onError: () =>
						toast.show({ description: t('network-request-failed') }),
				},
			},
		)

	useEffect(() => {
		if (!params?.mustAccept) return

		navigation.setOptions({
			headerLeft: () =>
				accepted ? (
					<Icon
						ml={4}
						p='4'
						name={I18nManager.isRTL ? 'ChevronRightSolid' : 'ChevronLeftSolid'}
						color='primary.600'
						onPress={() => navigation.goBack()}
					/>
				) : null,
		})

		navigation.addListener('beforeRemove', e => {
			if (accepted) navigation.dispatch(e.data.action)
			else e.preventDefault()
		})
	}, [navigation, accepted])

	if (loading) return null

	return (
		<ScrollView p='8' flex={1}>
			<Section
				label={t('privacy-policy', {
					version: `${data.latestPrivacyPolicy.version}.0`,
				})}
				textAlign='center'
				space='md'
			>
				<Text fontSize='md' color='gray.600'>
					{data?.latestPrivacyPolicy?.content}
				</Text>

				{params?.mustAccept && (
					<Button
						isLoading={acceptPrivacyPolicyLoading}
						onPress={() =>
							acceptPrivacyPolicy({
								variables: { where: { id: data?.latestPrivacyPolicy?.id } },
							})
						}
					>
						{t('accept')}
					</Button>
				)}
			</Section>
		</ScrollView>
	)
}

export type PrivacyPolicyScreenParams = {
	mustAccept?: boolean
}
