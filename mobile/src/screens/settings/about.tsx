import { Section } from '../../components/layout/Section'
import { Text } from 'native-base'
import { useTranslation } from 'react-i18next'
import { useTypedQuery } from '../../api'
import React from 'react'
import ScrollView from '../../components/layout/ScrollView'

export default function AboutScreen() {
	const { t } = useTranslation('settings')

	const { data, loading } = useTypedQuery({
		latestAbout: {
			id: true,
			content: true,
		},
	})

	if (loading) return null

	return (
		<ScrollView flex={1} p='8'>
			<Section label={t('about-nasmaakum')} textAlign='center' space='md'>
				<Text color='gray.500'>{data?.latestAbout?.content}</Text>
			</Section>
		</ScrollView>
	)
}

export type AboutScreenParams = undefined
