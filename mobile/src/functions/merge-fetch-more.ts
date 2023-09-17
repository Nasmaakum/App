import {
	KeyArgsFunction,
	KeySpecifier,
} from '@apollo/client/cache/inmemory/policies'

export default function MergeFetchMore() {
	return {
		keyArgs: false as false | KeySpecifier | KeyArgsFunction | undefined,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		merge: (existing: any = [], incoming: any) => [
			...existing,
			...incoming.filter(
				({ __ref: newRef }: RefType) =>
					!existing.find(({ __ref: oldRef }: RefType) => newRef === oldRef),
			),
		],
	}
}

type RefType = { __ref: string }
