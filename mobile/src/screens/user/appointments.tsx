import { BottomNavigation } from '../../components/BottomNavigation'
import { Box, Text } from 'native-base'
import { Section } from '../../components/layout/Section'
import { useTranslation } from 'react-i18next'
import React from 'react'
import ScrollView from '../../components/layout/ScrollView'

export default function AppointmentsScreen() {
	const { t } = useTranslation('user')

	return (
		<Box flex={1}>
			<ScrollView p='8' pb='32' position='relative'>
				<Section label={t('appointments')} space='lg' textAlign='center'>
					<Text
						fontSize='2xl'
						textAlign='center'
						fontWeight='bold'
						color='gray.600'
					>
						{t('coming-soon')}...
					</Text>
				</Section>
			</ScrollView>

			<BottomNavigation activeScreen='Appointments' />
		</Box>
	)
}

export type AppointmentsScreenParams = undefined
