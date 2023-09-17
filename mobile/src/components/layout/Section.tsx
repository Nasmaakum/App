import { ITextProps, Text, VStack } from 'native-base'
import { IVStackProps } from 'native-base/lib/typescript/components/primitives/Stack/VStack'
import React from 'react'

export const Section = (props: SectionProps) => {
	const { label, children, containerProps, textAlign, ...rest } = props

	return (
		<VStack space='md' {...containerProps}>
			<Text
				fontSize='2xl'
				fontWeight='bold'
				color='primary.600'
				textAlign={textAlign}
			>
				{label}
			</Text>

			<VStack {...rest}>{children}</VStack>
		</VStack>
	)
}

interface SectionProps extends IVStackProps {
	label: string
	containerProps?: IVStackProps
	textAlign?: ITextProps['textAlign']
}
