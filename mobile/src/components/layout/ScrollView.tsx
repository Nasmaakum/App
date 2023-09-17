import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack'
import {
	KeyboardAwareScrollView,
	KeyboardAwareScrollViewProps,
} from 'react-native-keyboard-aware-scroll-view'
import { RefreshControl } from 'react-native'
import { useTheme, VStack } from 'native-base'
import React from 'react'

export default function ScrollView(props: Props) {
	const { children, onScroll, onRefresh, refreshing, ...rest } = props

	const theme = useTheme()

	return (
		<KeyboardAwareScrollView
			keyboardOpeningTime={0}
			enableOnAndroid={false}
			showsHorizontalScrollIndicator={false}
			showsVerticalScrollIndicator={false}
			scrollEventThrottle={400}
			refreshControl={
				onRefresh && (
					<RefreshControl
						refreshing={refreshing}
						colors={[theme.colors.primary[400]]}
						onRefresh={() => {
							onRefresh()
						}}
					/>
				)
			}
			overScrollMode='never'
			enableAutomaticScroll
			onScroll={onScroll}
		>
			<VStack {...rest}>{children}</VStack>
		</KeyboardAwareScrollView>
	)
}

ScrollView.defaultProps = {} as Partial<Props>

interface Props extends IVStackProps {
	onRefresh: () => void
	onScroll: KeyboardAwareScrollViewProps['onScroll']
	refreshing?: boolean
}
