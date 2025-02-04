import { RoboResponse } from '@robojs/server'
import type { RoboRequest } from '@robojs/server'

interface RequestBody {
	code: string
}

export default async (req: RoboRequest) => {
	const { code } = (await req.json()) as RequestBody

	const response = await fetch(`https://discord.com/api/oauth2/token`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: new URLSearchParams({
			client_id: process.env.VITE_DISCORD_CLIENT_ID!,
			client_secret: process.env.DISCORD_CLIENT_SECRET!,
			grant_type: 'authorization_code',
			code: code
		})
	})
	const data = await response.json()

	return RoboResponse.json(data, {
		status: response.status
	})
}
