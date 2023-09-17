/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
const DEBUG = process.env.DEBUG === 'true'

export function log(logs: Log[], bypassDebug = false) {
	if (DEBUG || bypassDebug) console.log(JSON.stringify(logs, null, 2))
}

export function error(errors: Error[], bypassDebug = false) {
	if (DEBUG || bypassDebug) console.error(JSON.stringify(errors, null, 2))
}

type Log = {
	description: string
	log: any
}

type Error = {
	description: string
	err: any
}
