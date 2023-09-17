import * as FontAwesome from '@404-software/fontawesome'
import {
	IIconProps,
	IPressableProps,
	Icon as NBIcon,
	Pressable,
} from 'native-base'
import React from 'react'

export default function Icon(props: IconProps) {
	const { name, pressableProps, color, onPress, ...rest } = props

	return (
		<Pressable
			disabled={!onPress}
			hitSlop={8}
			onPress={onPress}
			{...pressableProps}
		>
			{({ isPressed }) => (
				<NBIcon
					as={FontAwesome[name]}
					color={color ?? 'white'}
					size='lg'
					opacity={isPressed ? 0.3 : 1}
					{...rest}
				/>
			)}
		</Pressable>
	)
}

interface IconProps extends IIconProps {
	name: IconsType
	pressableProps?: IPressableProps
	onPress?: () => void
}

export type IconsType = FontAwesome.FontAwesomeIcons
