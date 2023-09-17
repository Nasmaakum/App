import { IKeyboardAvoidingViewProps } from 'native-base/lib/typescript/components/basic/KeyboardAvoidingView/types'
import { Platform } from 'react-native'
import { KeyboardAvoidingView as RNKeyboardAvoidingView } from 'native-base'
import React from 'react'
export default function KeyboardAvoidingView(props: Props) {
	const { children, style, ...rest } = props

	return (
		<RNKeyboardAvoidingView
			{...rest}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={{ flex: 1 }}
		>
			{children}
		</RNKeyboardAvoidingView>
	)
}

KeyboardAvoidingView.defaultProps = {} as Partial<Props>

interface Props extends IKeyboardAvoidingViewProps {}
