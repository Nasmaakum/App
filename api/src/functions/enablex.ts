import axios from 'axios'

const ENABLEX_APP_ID = process.env.ENABLEX_APP_ID
const ENABLEX_APP_KEY = process.env.ENABLEX_APP_KEY
const ENABLEX_BASE_URL = process.env.ENABLEX_BASE_URL

if (!ENABLEX_APP_ID || !ENABLEX_APP_KEY || !ENABLEX_BASE_URL)
	throw new Error('Missing EnableX credentials')

const usernamePasswordBuffer = Buffer.from(
	`${ENABLEX_APP_ID}:${ENABLEX_APP_KEY}`,
)
const base64data = usernamePasswordBuffer.toString('base64')
const enablex = axios.create({
	baseURL: ENABLEX_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
		Authorization: `Basic ${base64data}`,
	},
})

type Room = {
	name: string
	owner_ref: string
	settings?: {
		description?: string
		mode: 'group' | 'lecture'
		scheduled: boolean
		adhoc: boolean
		scheduled_time?: string
		duration: number
		moderators: string
		participants: string
		audiences?: string
		send_audiences_stats?: boolean
		hls_view_url?: string
		auto_recording?: boolean
		screen_share?: boolean
		knock?: boolean
		wait_for_moderator?: boolean
		quality?: 'LD' | 'SD' | 'HD'
		billing_code?: string
		abwd?: boolean
		facex?: boolean
		max_active_talkers?: number
		single_file_recording?: boolean
		role_based_recording?: 'audiovideo' | 'audio'
		live_recording?: boolean
		media_zone: 'IN' | 'SG' | 'US' | 'XX'
		watermark?: boolean
	}
	sip?: {
		[key: string]: string | boolean
	}
	enabled?: boolean
	data?: {
		[key: string]: string
	}
	created: string
	room_id: string
}

type CreateEnablexRoomParams = {
	name: string
	owner_ref: string
	settings?: {
		description?: string
		mode: 'group' | 'lecture'
		scheduled: boolean
		adhoc?: boolean
		scheduled_time: string
		duration: number
		moderators: string
		participants: string
		audiences?: string
		send_audiences_stats?: boolean
		hls_view_url?: string
		auto_recording?: boolean
		screen_share?: boolean
		knock?: boolean
		wait_for_moderator?: boolean
		quality?: 'LD' | 'SD' | 'HD'
		billing_code?: string
		abwd?: boolean
		facex?: boolean
		max_active_talkers?: number
		single_file_recording?: boolean
		role_based_recording?: 'audiovideo' | 'audio'
		live_recording?: boolean
		media_zone?: 'IN' | 'SG' | 'US' | 'XX'
		watermark?: boolean
	}
	sip?: {
		[key: string]: string | boolean
	}
	enabled?: boolean
	data?: {
		[key: string]: string
	}
}

type CreateEnablexRoomResponse = {
	result: number
	room: Room
}

export const createEnablexRoom = async (
	params: CreateEnablexRoomParams,
): Promise<CreateEnablexRoomResponse> => {
	const { data } = await enablex.post('/rooms', params)

	return data
}

type GetEnablexRooms = {
	result: number
	rooms: Room[]
}

export const getEnablexRooms = async (): Promise<GetEnablexRooms> => {
	const { data } = await enablex.get('/rooms')

	return data
}

type GetEnablexRoomParams = {
	roomId: string
}

type GetEnablexRoom = {
	result: number
	room: Room
}

export const getEnablexRoom = async (
	params: GetEnablexRoomParams,
): Promise<GetEnablexRoom> => {
	const { roomId } = params

	const { data } = await enablex.get(`/rooms/${roomId}`)

	return data
}

type UpdateEnablexRoomParams = {
	name?: string
	owner_ref?: string
	settings?: {
		mode?: 'group' | 'lecture'
		scheduled?: boolean
		adhoc?: boolean
		scheduled_time?: string
		duration?: number
		moderators?: string
		participants?: string
		audiences?: string
		send_audiences_stats?: boolean
		hls_view_url?: string
		auto_recording?: boolean
		screen_share?: boolean
		knock?: boolean
		wait_for_moderator?: boolean
		quality?: 'LD' | 'SD' | 'HD'
		billing_code?: string
		abwd?: boolean
		facex?: boolean
		max_active_talkers?: number
		single_file_recording?: boolean
		role_based_recording?: 'audiovideo' | 'audio'
		live_recording?: boolean
		media_zone?: 'IN' | 'SG' | 'US' | 'XX'
		watermark?: boolean
	}
	sip?: {
		[key: string]: string
	}
	enabled?: boolean
	data?: {
		[key: string]: string
	}
}

type UpdateEnablexRoomResponse = {
	result: number
}

export const updateEnablexRoom = async (
	roomId: string,
	params: UpdateEnablexRoomParams,
): Promise<UpdateEnablexRoomResponse> => {
	const { data } = await enablex.put(`/rooms/${roomId}`, params)

	return data
}

type DeleteEnablexRoomResponse = {
	result: number
}

export const deleteEnablexRoom = async (
	roomId: string,
): Promise<DeleteEnablexRoomResponse> => {
	const { data } = await enablex.delete(`/rooms/${roomId}`)

	return data
}

type User = {
	name: string
	user_ref: string
	role: 'moderator' | 'participant' | 'audience'
	permissions: {
		publish: boolean
		subscribe: boolean
		record: boolean
		stats: boolean
		controlhandlers: boolean
	}
}

type GetEnablexRoomUsersResponse = {
	result: number
	total: number
	users: User[]
}

export const getEnablexRoomUsers = async (
	roomId: string,
): Promise<GetEnablexRoomUsersResponse> => {
	const { data } = await enablex.get(`/rooms/${roomId}/users`)

	return data
}

type CreateEnablexTokenParams = {
	name: string
	role: 'moderator' | 'participant' | 'audience' | 'viewer'
	user_ref: string
	data?: {
		[key: string]: string
	}
}

type CreateEnablexTokenResponse = {
	result: number
	token: string
}

export const createEnablexToken = async (
	roomId: string,
	params: CreateEnablexTokenParams,
): Promise<CreateEnablexTokenResponse> => {
	const { data } = await enablex.post(`/rooms/${roomId}/tokens`, params)

	return data
}

type EnablexCDR = {
	trans_date: string
	conf_num: string
	call_num: string
	call_log_id: string
	room: {
		room_id: string
		connect_dt: string
		disconnect_dt: string
		duration: number
	}
	user: {
		ip: string
		name: string
		role: 'moderator' | 'participant' | 'audience' | 'viewer'
		ref: string
		agent: string
		token: string
		confName: string
	}
	sigserver: {
		connect_dt: string
		ip: string
		disconnect_dt: string
		duration: number
		hold_duration: number
	}
	published_track: {
		audio: 'true' | 'false'
		data: 'true' | 'false'
		video: 'true' | 'false'
		screen: 'true' | 'false'
		url: 'true' | 'false'
	}
	usage: {
		subscribed_minutes: number
		published_minutes: number
	}
	app_id: string
	cdr_id: string
}

type GetEnablexCDRResponse = {
	result: number
	cdr: EnablexCDR[]
}

type GetEnablexCDRPeriodParams = {
	from: string
	to: string
}

export const getEnablexCDRPeriod = async (
	params: GetEnablexCDRPeriodParams,
): Promise<GetEnablexCDRResponse> => {
	const { data } = await enablex.get(`/cdr/period/${params.from}/${params.to}`)

	return data
}

export const getEnablexCDRRoom = async (
	roomId: string,
): Promise<GetEnablexCDRResponse> => {
	const { data } = await enablex.get(`/cdr/room/${roomId}`)

	return data
}

export const getEnablexCDRRoomPeriod = async (
	roomId: string,
	params: GetEnablexCDRPeriodParams,
): Promise<GetEnablexCDRResponse> => {
	const { data } = await enablex.get(
		`/cdr/room-period/${roomId}/period/${params.from}/${params.to}`,
	)

	return data
}

export const getEnablexCDRConference = async (
	conferenceId: string,
): Promise<GetEnablexCDRResponse> => {
	const { data } = await enablex.get(`/cdr/conf/${conferenceId}`)

	return data
}

type EnablexArchive = {
	_id: string
	trans_date: string
	conf_num: string
	app_id: string
	room_id: string
	recording: Array<{ url: string }>
	transcoded: Array<{ url: string }>
	chatdata: string
	metadata: string
}

type GetEnablexRecordingPeriodParams = {
	from: string
	to: string
}

type GetEnablexRecordingPeriodResponse = {
	result: number
	archive: EnablexArchive[]
}

export const getEnablexRecordingPeriod = async (
	params: GetEnablexRecordingPeriodParams,
): Promise<GetEnablexRecordingPeriodResponse> => {
	const { data } = await enablex.get(
		`/archive/period/${params.from}/${params.to}`,
	)

	return data
}

export const getEnablexRecordingRoom = async (
	roomId: string,
): Promise<GetEnablexRecordingPeriodResponse> => {
	const { data } = await enablex.get(`/archive/room/${roomId}`)

	return data
}

export const getEnablexRecordingRoomPeriod = async (
	roomId: string,
	params: GetEnablexRecordingPeriodParams,
): Promise<GetEnablexRecordingPeriodResponse> => {
	const { data } = await enablex.get(
		`/archive/room-period/${roomId}/period/${params.from}/${params.to}`,
	)

	return data
}

export const getEnablexRecordingConference = async (
	conferenceId: string,
): Promise<GetEnablexRecordingPeriodResponse> => {
	const { data } = await enablex.get(`/archive/conf/${conferenceId}`)

	return data
}

type GetEnablexDialInNumbersResponse = {
	_id: string
	app_key: string
	settings?: {
		sip?: true
	}
	sip?: {
		server_url: string
		username: string
		password: string
		sig_servers: string[]
		media_servers: string[]
	}
	dialin: Array<{
		country: string
		country_code: string
		phone: string
		toll: boolean
	}>
}

export const getEnablexDialInNumbers =
	async (): Promise<GetEnablexDialInNumbersResponse> => {
		const { data } = await enablex.get('/dialin')

		return data
	}
