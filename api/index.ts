import {
	useTypedLazyQuery,
	useTypedMutation,
	useTypedQuery,
} from './zeus/apollo'

import { $, GraphQLTypes } from './zeus'

const sanitizeData = <T>(data: T, others?: Array<keyof T>) => {
	const dataObj = {
		...data,
		__typename: undefined,
		id: undefined,
	}

	others?.forEach(key => delete dataObj[key])

	return dataObj
}

export { useTypedLazyQuery, useTypedMutation, useTypedQuery, sanitizeData, $ }

export type { GraphQLTypes }
