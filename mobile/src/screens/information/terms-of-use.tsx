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

export default function TermsOfUseScreen({
	route: { params },
	navigation,
}: RootStackScreenProps<'TermsOfUse'>) {
	const toast = useToast()

	const { t } = useTranslation('information')

	const [accepted, setAccepted] = useState(false)

	const { data, loading } = useTypedQuery({
		latestTermsOfUse: {
			id: true,
			content: true,
			version: true,
		},
	})

	const [acceptTermsOfUse, { loading: acceptTermsOfUseLoading }] =
		useTypedMutation(
			{
				acceptTermsOfUse: [
					{ where: $('where', 'TermsOfUseWhereInput!') },
					{ id: true },
				],
			},
			{
				apolloOptions: {
					onCompleted: () => {
						setAccepted(true)
						toast.show({ description: t('terms-of-use-accepted') })
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
				label={t('terms-of-use', {
					version: `${data.latestTermsOfUse.version}.0`,
				})}
				textAlign='center'
				space='md'
			>
				<Text fontSize='md' color='gray.600'>
					{data?.latestTermsOfUse?.content}
				</Text>

				{params?.mustAccept && (
					<Button
						isLoading={acceptTermsOfUseLoading}
						onPress={() =>
							acceptTermsOfUse({
								variables: { where: { id: data?.latestTermsOfUse?.id } },
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

export type TermsOfUseScreenParams = {
	mustAccept?: boolean
}
