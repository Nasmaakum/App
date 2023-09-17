import { createDrawerNavigator } from '@react-navigation/drawer'
import {
	createStackNavigator,
	TransitionPresets,
} from '@react-navigation/stack'
import { DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { I18nManager } from 'react-native'
import { Image, StatusBar } from 'native-base'
import { switchLanguage } from '../utils/i18n/i18n'
import React from 'react'

import {
	AuthStackParamList,
	HomeStackParamList,
	InterpreterStackParamList,
	RootStackParamList,
	SettingsStackParamList,
} from './types'
import LinkingConfiguration from './linking-configuration'

import { useAuth } from '../contexts/auth'

import useNotifications, {
	setNotificationHandler,
} from '../hooks/useNotifications'

import { DrawerContent } from '../components/layout/DrawerContent'
import Icon from '../components/Icon'

import AboutScreen from '../screens/settings/about'
import ChangePasswordScreen from '../screens/settings/change-password'
// import ConversationScreen from '../screens/chat/conversation'
import FeedbackScreen from '../screens/interpreter/feedback'
import ForgetPasswordScreen from '../screens/auth/reset/forget-password'
import GetStartedScreen from '../screens/auth/get-started'
import HelpScreen from '../screens/settings/help'
import HomeScreen from '../screens/home'
import InterpreterScreen from '../screens/interpreter/interpreter'
import LoginScreen from '../screens/auth/login'
// import MessagesScreen from '../screens/chat/messages'
import AppointmentsScreen from '../screens/user/appointments'
import AvailabilityScreen from '../screens/interpreter/availability'
import CallingScreen from '../screens/interpreter/calling'
import CallScreen from '../screens/interpreter/call'
import IncomingCallScreen from '../screens/interpreter/incoming-call'
import MyProfileScreen from '../screens/user/my-profile'
import NotificationsScreen from '../screens/user/notifications'
import PrivacyPolicyScreen from '../screens/information/privacy-policy'
import RegisterFourScreen from '../screens/auth/register/register-four'
import RegisterOneScreen from '../screens/auth/register/register-one'
import RegisterThreeScreen from '../screens/auth/register/register-three'
import RegisterTwoScreen from '../screens/auth/register/register-two'
import ResetPasswordScreen from '../screens/auth/reset/reset-password'
import SettingsScreen from '../screens/settings/settings'
import TermsOfUseScreen from '../screens/information/terms-of-use'
import VerifyOTPScreen from '../screens/auth/reset/verify-opt'

export default function Navigation() {
	const { isLoggedIn } = useAuth()

	return (
		<NavigationContainer
			linking={LinkingConfiguration}
			theme={{
				...DefaultTheme,
				colors: { ...DefaultTheme.colors, background: 'white' },
			}}
		>
			{isLoggedIn ? <RootNavigator /> : <AuthNavigator />}

			<StatusBar barStyle='dark-content' backgroundColor='#fff' />
		</NavigationContainer>
	)
}

const RootStack = createStackNavigator<RootStackParamList>()

function RootNavigator() {
	return (
		<RootStack.Navigator
			initialRouteName='HomeStack'
			screenOptions={({ navigation }) => ({
				headerBackTitleVisible: false,
				headerTitleAlign: 'center',
				headerStyle: {
					borderBottomWidth: 0,
					shadowColor: 'transparent',
				},
				overlayColor: '#ffffff99',
				headerTintColor: 'black',
				headerLeft: () =>
					navigation.canGoBack() ? (
						<Icon
							ml={4}
							p='4'
							name={
								I18nManager.isRTL ? 'ChevronRightSolid' : 'ChevronLeftSolid'
							}
							color='primary.600'
							onPress={() => navigation.goBack()}
						/>
					) : null,
				headerTitle: () => (
					<Image
						source={require('../assets/images/logo.png')}
						style={{ resizeMode: 'contain' }}
						w='56'
						h='full'
						alt='Logo'
					/>
				),
			})}
		>
			<RootStack.Screen name='TermsOfUse' component={TermsOfUseScreen} />

			<RootStack.Screen name='PrivacyPolicy' component={PrivacyPolicyScreen} />

			<RootStack.Screen name='Availability' component={AvailabilityScreen} />

			<RootStack.Screen name='MyProfile' component={MyProfileScreen} />

			<RootStack.Screen name='Notifications' component={NotificationsScreen} />

			{/* <RootStack.Screen name='Messages' component={MessagesScreen} /> */}

			{/* <RootStack.Screen name='Conversation' component={ConversationScreen} /> */}

			<RootStack.Screen
				name='HomeStack'
				component={HomeNavigator}
				options={{ headerShown: false }}
			/>

			<RootStack.Screen
				name='SettingsStack'
				component={SettingsNavigator}
				options={{ headerShown: false }}
			/>

			<RootStack.Screen
				name='InterpreterStack'
				component={InterpreterNavigator}
				options={{ headerShown: false }}
			/>
		</RootStack.Navigator>
	)
}

const HomeStack = createDrawerNavigator<HomeStackParamList>()
function HomeNavigator() {
	useNotifications()

	return (
		<HomeStack.Navigator
			initialRouteName='Home'
			drawerContent={({ navigation }) => (
				<DrawerContent navigation={navigation} />
			)}
			screenOptions={({ navigation }) => ({
				drawerType: 'front',
				headerBackTitleVisible: false,
				headerTitleAlign: 'center',
				drawerStyle: {
					backgroundColor: 'transparent',
					width: '100%',
				},
				drawerStatusBarAnimation: 'fade',
				headerStyle: {
					borderBottomWidth: 0,
					shadowColor: 'transparent',
				},
				overlayColor: '#ffffff99',
				headerTintColor: 'black',
				headerLeft: () =>
					navigation.canGoBack() ? (
						<Icon
							ml={4}
							p='4'
							name={
								I18nManager.isRTL ? 'ChevronRightSolid' : 'ChevronLeftSolid'
							}
							color='primary.600'
							onPress={() => navigation.goBack()}
						/>
					) : null,
				headerTitle: () => (
					<Image
						source={require('../assets/images/logo.png')}
						style={{ resizeMode: 'contain' }}
						w='56'
						h='full'
						alt='Logo'
					/>
				),
				headerRight: () => (
					<Icon
						mr={4}
						size='2xl'
						name='EarthAsiaSolid'
						color='primary.600'
						onPress={() => switchLanguage()}
					/>
				),
			})}
		>
			<HomeStack.Screen
				name='Home'
				component={HomeScreen}
				options={({ navigation }) => ({
					headerLeft: () => (
						<Icon
							ml={4}
							p='4'
							size='2xl'
							name='BarsSolid'
							color='primary.600'
							onPress={() => navigation.openDrawer()}
						/>
					),
				})}
			/>

			<HomeStack.Screen
				name='Appointments'
				component={AppointmentsScreen}
				options={({ navigation }) => ({
					headerLeft: () => (
						<Icon
							ml={4}
							p='4'
							size='2xl'
							name='BarsSolid'
							color='primary.600'
							onPress={() => navigation.openDrawer()}
						/>
					),
				})}
			/>
		</HomeStack.Navigator>
	)
}

const SettingsStack = createStackNavigator<SettingsStackParamList>()
function SettingsNavigator() {
	return (
		<SettingsStack.Navigator
			initialRouteName='Settings'
			screenOptions={({ navigation }) => ({
				headerBackTitleVisible: false,
				headerTitleAlign: 'center',
				headerStyle: {
					borderBottomWidth: 0,
					shadowColor: 'transparent',
				},
				overlayColor: '#ffffff99',
				headerTintColor: 'black',
				headerLeft: () =>
					navigation.canGoBack() ? (
						<Icon
							ml={4}
							p='4'
							name={
								I18nManager.isRTL ? 'ChevronRightSolid' : 'ChevronLeftSolid'
							}
							color='primary.600'
							onPress={() => navigation.goBack()}
						/>
					) : null,
				headerTitle: () => (
					<Image
						source={require('../assets/images/logo.png')}
						style={{ resizeMode: 'contain' }}
						w='56'
						h='full'
						alt='Logo'
					/>
				),
			})}
		>
			<SettingsStack.Screen name='Settings' component={SettingsScreen} />

			<SettingsStack.Screen
				name='ChangePassword'
				component={ChangePasswordScreen}
			/>

			<SettingsStack.Screen name='About' component={AboutScreen} />

			<SettingsStack.Screen name='Help' component={HelpScreen} />
		</SettingsStack.Navigator>
	)
}

const InterpreterStack = createStackNavigator<InterpreterStackParamList>()

function InterpreterNavigator() {
	return (
		<InterpreterStack.Navigator
			initialRouteName='Interpreter'
			screenOptions={({ navigation }) => ({
				headerBackTitleVisible: false,
				headerTitleAlign: 'center',
				headerStyle: {
					borderBottomWidth: 0,
					shadowColor: 'transparent',
				},
				overlayColor: '#ffffff99',
				headerTintColor: 'black',
				headerLeft: () =>
					navigation.canGoBack() ? (
						<Icon
							ml={4}
							p='4'
							name={
								I18nManager.isRTL ? 'ChevronRightSolid' : 'ChevronLeftSolid'
							}
							color='primary.600'
							onPress={() => navigation.goBack()}
						/>
					) : null,
				headerTitle: () => (
					<Image
						source={require('../assets/images/logo.png')}
						style={{ resizeMode: 'contain' }}
						w='56'
						h='full'
						alt='Logo'
					/>
				),
			})}
		>
			<InterpreterStack.Screen
				name='Interpreter'
				component={InterpreterScreen}
			/>

			<InterpreterStack.Screen
				name='IncomingCall'
				component={IncomingCallScreen}
				options={{
					headerLeft: () => null,
				}}
			/>

			<InterpreterStack.Screen name='Call' component={CallScreen} />

			<InterpreterStack.Screen
				name='Calling'
				component={CallingScreen}
				options={{
					headerLeft: () => null,
				}}
			/>

			<InterpreterStack.Screen
				name='Feedback'
				component={FeedbackScreen}
				options={({ navigation }) => ({
					headerLeft: () => null,
					headerRight: () => (
						<Icon
							mr={4}
							p='4'
							name='XSolid'
							color='primary.600'
							onPress={() => navigation.goBack()}
						/>
					),
				})}
			/>
		</InterpreterStack.Navigator>
	)
}

const AuthStack = createStackNavigator<AuthStackParamList>()
function AuthNavigator() {
	setNotificationHandler(false)

	return (
		<AuthStack.Navigator
			initialRouteName='GetStarted'
			screenOptions={({ navigation }) => ({
				headerBackTitleVisible: false,
				headerTitleAlign: 'center',
				headerStyle: {
					backgroundColor: 'white',
					borderBottomWidth: 0,
					shadowColor: 'transparent',
				},
				headerTintColor: 'white',
				headerTitle: () => (
					<Image
						source={require('../assets/images/logo.png')}
						style={{ resizeMode: 'contain' }}
						w='56'
						h='full'
						alt='Logo'
					/>
				),
				headerLeft: () =>
					navigation.canGoBack() ? (
						<Icon
							ml={4}
							p='4'
							name={
								I18nManager.isRTL ? 'ChevronRightSolid' : 'ChevronLeftSolid'
							}
							color='primary.600'
							onPress={() => navigation.goBack()}
						/>
					) : null,
				headerRight: () => (
					<Icon
						mr={4}
						name='EarthAsiaSolid'
						color='primary.600'
						onPress={() => switchLanguage()}
					/>
				),
			})}
		>
			<AuthStack.Screen
				name='GetStarted'
				component={GetStartedScreen}
				options={{
					...TransitionPresets.SlideFromRightIOS,
					headerRight: () => null,
					headerTitle: () => null,
				}}
			/>

			<AuthStack.Screen
				name='Login'
				component={LoginScreen}
				options={{
					...TransitionPresets.SlideFromRightIOS,
				}}
			/>

			<AuthStack.Screen
				name='RegisterOne'
				component={RegisterOneScreen}
				options={{
					...TransitionPresets.SlideFromRightIOS,
				}}
			/>

			<AuthStack.Screen
				name='RegisterTwo'
				component={RegisterTwoScreen}
				options={{
					...TransitionPresets.SlideFromRightIOS,
				}}
			/>

			<AuthStack.Screen
				name='RegisterFour'
				component={RegisterFourScreen}
				options={{
					...TransitionPresets.SlideFromRightIOS,
				}}
			/>

			<AuthStack.Screen
				name='RegisterThree'
				component={RegisterThreeScreen}
				options={{
					...TransitionPresets.SlideFromRightIOS,
					headerLeft: () => null,
					headerRight: () => null,
				}}
			/>

			<AuthStack.Screen
				name='ForgetPassword'
				component={ForgetPasswordScreen}
				options={{
					...TransitionPresets.RevealFromBottomAndroid,
				}}
			/>

			<AuthStack.Screen
				name='VerifyOTP'
				component={VerifyOTPScreen}
				options={{
					...TransitionPresets.RevealFromBottomAndroid,
				}}
			/>

			<AuthStack.Screen
				name='ResetPassword'
				component={ResetPasswordScreen}
				options={{
					...TransitionPresets.RevealFromBottomAndroid,
				}}
			/>

			<AuthStack.Screen
				name='TermsOfUse'
				options={{ presentation: 'modal' }}
				component={TermsOfUseScreen}
			/>

			<AuthStack.Screen
				name='PrivacyPolicy'
				options={{ presentation: 'modal' }}
				component={PrivacyPolicyScreen}
			/>
		</AuthStack.Navigator>
	)
}
