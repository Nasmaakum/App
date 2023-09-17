import { DrawerScreenProps } from '@react-navigation/drawer'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AboutScreenParams } from '../screens/settings/about'
import { ChangePasswordScreenParams } from '../screens/settings/change-password'
// import { ConversationScreenParams } from '../screens/chat/conversation'
import { FeedbackScreenParams } from '../screens/interpreter/feedback'
import { ForgetPasswordScreenParams } from '../screens/auth/reset/forget-password'
import { GetStartedScreenParams } from '../screens/auth/get-started'
import { HelpScreenParams } from '../screens/settings/help'
import { HomeScreenParams } from '../screens/home'
import { InterpreterScreenParams } from '../screens/interpreter/interpreter'
import { LoginScreenParams } from '../screens/auth/login'
// import { MessagesScreenParams } from '../screens/chat/messages'
import { AppointmentsScreenParams } from '../screens/user/appointments'
import { AvailabilityScreenParams } from '../screens/interpreter/availability'
import { CallingScreenParams } from '../screens/interpreter/calling'
import { CallScreenParams } from '../screens/interpreter/call'
import { IncomingCallScreenParams } from '../screens/interpreter/incoming-call'
import { MyProfileScreenParams } from '../screens/user/my-profile'
import { NotificationsScreenParams } from '../screens/user/notifications'
import { PrivacyPolicyScreenParams } from '../screens/information/privacy-policy'
import { RegisterFourScreenParams } from '../screens/auth/register/register-four'
import { RegisterOneScreenParams } from '../screens/auth/register/register-one'
import { RegisterThreeScreenParams } from '../screens/auth/register/register-three'
import { RegisterTwoScreenParams } from '../screens/auth/register/register-two'
import { ResetPasswordScreenParams } from '../screens/auth/reset/reset-password'
import { SettingsScreenParams } from '../screens/settings/settings'
import { TermsOfUseScreenParams } from '../screens/information/terms-of-use'
import { VerifyOTPScreenParams } from '../screens/auth/reset/verify-opt'

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace ReactNavigation {
		interface RootParamList extends RootStackParamList {}
	}
}

type NestedNavigatorParams<ParamList> = {
	[K in keyof ParamList]: undefined extends ParamList[K]
		? { screen: K; params?: ParamList[K] }
		: { screen: K; params: ParamList[K] }
}[keyof ParamList]

export type RootStackParamList = {
	HomeStack: NestedNavigatorParams<HomeStackParamList>
	InterpreterStack: NestedNavigatorParams<InterpreterStackParamList>
	SettingsStack: NestedNavigatorParams<SettingsStackParamList>

	TermsOfUse: TermsOfUseScreenParams
	PrivacyPolicy: PrivacyPolicyScreenParams

	MyProfile: MyProfileScreenParams
	Notifications: NotificationsScreenParams

	Availability: AvailabilityScreenParams

	// Messages: MessagesScreenParams
	// Conversation: ConversationScreenParams
}

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
	NativeStackScreenProps<RootStackParamList, Screen>

export type HomeStackParamList = {
	Home: HomeScreenParams
	Appointments: AppointmentsScreenParams
}

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> =
	DrawerScreenProps<HomeStackParamList & RootStackParamList, Screen>

export type SettingsStackParamList = {
	Settings: SettingsScreenParams
	About: AboutScreenParams
	Help: HelpScreenParams
	ChangePassword: ChangePasswordScreenParams
}

export type SettingsStackScreenProps<
	Screen extends keyof SettingsStackParamList,
> = NativeStackScreenProps<SettingsStackParamList & RootStackParamList, Screen>

export type InterpreterStackParamList = {
	Interpreter: InterpreterScreenParams
	Call: CallScreenParams
	Calling: CallingScreenParams
	IncomingCall: IncomingCallScreenParams
	Feedback: FeedbackScreenParams
}

export type InterpreterStackScreenProps<
	Screen extends keyof InterpreterStackParamList,
> = NativeStackScreenProps<
	InterpreterStackParamList & RootStackParamList,
	Screen
>

export type AuthStackParamList = {
	GetStarted: GetStartedScreenParams
	Login: LoginScreenParams

	ForgetPassword: ForgetPasswordScreenParams
	VerifyOTP: VerifyOTPScreenParams
	ResetPassword: ResetPasswordScreenParams

	RegisterOne: RegisterOneScreenParams
	RegisterTwo: RegisterTwoScreenParams
	RegisterThree: RegisterThreeScreenParams
	RegisterFour: RegisterFourScreenParams

	TermsOfUse: TermsOfUseScreenParams
	PrivacyPolicy: PrivacyPolicyScreenParams
}

export type AuthStackScreenProps<Screen extends keyof AuthStackParamList> =
	NativeStackScreenProps<AuthStackParamList, Screen>
