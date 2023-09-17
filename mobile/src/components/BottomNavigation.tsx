import { Box } from 'native-base'
import { Dimensions } from 'react-native'
import { PillTabs } from './PillTabs'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import React from 'react'

export const BottomNavigation = (props: BottomNavigationProps) => {
	const { activeScreen } = props

	const { t } = useTranslation('common')

	const navigation = useNavigation()

	const { fontSize } = (() => {
		const { width } = Dimensions.get('window')

		if (width >= 640) return { fontSize: 'sm' }
		if (width >= 300) return { fontSize: 'xs' }

		return { fontSize: '6' }
	})()

	return (
		<Box position='absolute' bottom={8} left={8} right={8} alignItems='center'>
			<PillTabs
				pills={[
					{
						active: activeScreen === 'Home',
						label: t('home'),
						icon: 'HouseSolid',
						onPress: () => navigation.navigate('HomeStack', { screen: 'Home' }),
						fontSize,
					},
					{
						active: activeScreen === 'Appointments',
						label: t('appointments'),
						icon: 'CalendarSolid',
						onPress: () =>
							navigation.navigate('HomeStack', { screen: 'Appointments' }),
						fontSize,
					},
				]}
			/>
		</Box>
	)
}

interface BottomNavigationProps {
	activeScreen: 'Home' | 'Appointments'
}
