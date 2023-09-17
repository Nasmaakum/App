import { HStack, Pressable, Text, VStack } from 'native-base'
import { I18nManager } from 'react-native'
import { Section } from '../../components/layout/Section'
import { useTranslation } from 'react-i18next'
import { useTypedQuery } from '../../api'
import Icon from '../../components/Icon'
import React, { useState } from 'react'
import ScrollView from '../../components/layout/ScrollView'

const HelpItem = (props: HelpItemProps) => {
	const { question, answer } = props

	const [isOpen, setIsOpen] = useState(false)

	return (
		<Pressable bg='white' onPress={() => setIsOpen(val => !val)}>
			<VStack px='8' py='6' space='md'>
				<HStack justifyContent='space-between'>
					<Text fontSize='md' color='gray.500' fontWeight='bold'>
						{question}
					</Text>

					<Icon
						name={
							isOpen
								? 'ChevronUpSolid'
								: I18nManager.isRTL
								? 'ChevronLeftSolid'
								: 'ChevronRightSolid'
						}
						color='primary.600'
					/>
				</HStack>

				{isOpen && (
					<Text fontSize='md' color='gray.500'>
						{answer}
					</Text>
				)}
			</VStack>
		</Pressable>
	)
}

interface HelpItemProps {
	question: string
	answer: string
}

export default function HelpScreen() {
	const { t } = useTranslation('settings')

	const { data, loading } = useTypedQuery({
		frequentlyAskedQuestions: [
			{ take: 100 },
			{ id: true, question: true, answer: true },
		],
	})

	if (loading) return null

	return (
		<ScrollView>
			<Section
				containerProps={{ flex: 1, py: 8 }}
				textAlign='center'
				label={t('help')}
			>
				<Section
					containerProps={{ flex: 1, pt: 4 }}
					textAlign='center'
					label={t('how-can-we-help-you')}
					space='sm'
					py='3'
					bg='gray.200'
				>
					{data?.frequentlyAskedQuestions.map(({ id, question, answer }) => (
						<HelpItem key={id} question={question} answer={answer} />
					))}
				</Section>
			</Section>
		</ScrollView>
	)
}

export type HelpScreenParams = undefined
