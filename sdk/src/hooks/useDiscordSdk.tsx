import { DiscordSDK, DiscordSDKMock } from '@discord/embedded-app-sdk'
import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import type { DiscordSession } from '../core/types.js'
import type { ReactNode } from 'react'

type AuthorizeInput = Parameters<typeof discordSdk.commands.authorize>[0]
type SdkSetupResult = ReturnType<typeof useDiscordSdkSetup>

const queryParams = new URLSearchParams(window.location.search)
const isEmbedded = queryParams.get('frame_id') != null

let discordSdk: DiscordSDK | DiscordSDKMock

if (isEmbedded) {
	discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID)
} else {
	const mockUserId = getOverrideOrRandomSessionValue('user_id')
	const mockGuildId = getOverrideOrRandomSessionValue('guild_id')
	const mockChannelId = getOverrideOrRandomSessionValue('channel_id')

	discordSdk = new DiscordSDKMock(import.meta.env.VITE_DISCORD_CLIENT_ID, mockGuildId, mockChannelId)
	const discriminator = String(mockUserId.charCodeAt(0) % 5)

	discordSdk._updateCommandMocks({
		authenticate: async () => {
			return {
				access_token: 'mock_token',
				user: {
					username: mockUserId,
					discriminator,
					id: mockUserId,
					avatar: null,
					public_flags: 1
				},
				scopes: [],
				expires: new Date(2112, 1, 1).toString(),
				application: {
					description: 'mock_app_description',
					icon: 'mock_app_icon',
					id: 'mock_app_id',
					name: 'mock_app_name'
				}
			}
		}
	})
}

export { discordSdk }

enum SessionStorageQueryParam {
	user_id = 'user_id',
	guild_id = 'guild_id',
	channel_id = 'channel_id'
}

function getOverrideOrRandomSessionValue(queryParam: `${SessionStorageQueryParam}`) {
	const overrideValue = queryParams.get(queryParam)
	if (overrideValue != null) {
		return overrideValue
	}

	const currentStoredValue = sessionStorage.getItem(queryParam)
	if (currentStoredValue != null) {
		return currentStoredValue
	}

	// Set queryParam to a random 8-character string
	const randomString = Math.random().toString(36).slice(2, 10)
	sessionStorage.setItem(queryParam, randomString)
	return randomString
}

const DiscordContext = createContext<SdkSetupResult>({
	accessToken: null,
	authenticated: false,
	discordSdk: discordSdk,
	error: null,
	session: {
		user: {
			id: '',
			username: '',
			discriminator: '',
			avatar: null,
			public_flags: 0
		},
		access_token: '',
		scopes: [],
		expires: '',
		application: {
			rpc_origins: undefined,
			id: '',
			name: '',
			icon: null,
			description: ''
		}
	},
	status: 'pending'
})

interface DiscordContextProviderProps {
	authenticate?: boolean
	children: ReactNode
	loadingScreen?: ReactNode
	scope?: AuthorizeInput['scope']
}
export function DiscordContextProvider(props: DiscordContextProviderProps) {
	const { authenticate, children, loadingScreen = null, scope } = props
	const setupResult = useDiscordSdkSetup({ authenticate, scope })

	if (loadingScreen && !['error', 'ready'].includes(setupResult.status)) {
		return <>{loadingScreen}</>
	}

	return <DiscordContext.Provider value={setupResult}>{children}</DiscordContext.Provider>
}

export function useDiscordSdk() {
	return useContext(DiscordContext)
}

interface AuthenticateSdkOptions {
	scope?: AuthorizeInput['scope']
}

export async function authenticateSdk(options?: AuthenticateSdkOptions) {
	const { scope = ['identify', 'guilds'] } = options ?? {}

	await discordSdk.ready()
	const { code } = await discordSdk.commands.authorize({
		client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
		response_type: 'code',
		state: '',
		prompt: 'none',
		scope: scope
	})

	const response = await fetch('/api/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ code })
	})

	const { access_token } = await response.json()

	const auth = await discordSdk.commands.authenticate({ access_token })

	if (auth == null) {
		throw new Error('Authenticate command failed')
	}
	return { accessToken: access_token, auth }
}

interface UseDiscordSdkSetupOptions {
	authenticate?: boolean
	scope?: AuthorizeInput['scope']
}

/**
 * Hook to check if the Discord SDK is ready.
 * Set `auth` to `true` to authenticate with Discord.
 *
 * @param options Options for the hook:
 * - `auth`: Authenticate with Discord
 * @returns Object with the access token, authentication status, Discord SDK instance, and error message
 * - `accessToken`: Access token
 * - `authenticated`: Authentication status
 * - `discordSdk`: Discord SDK instance
 * - `error`: Error message
 * - `status`: Status of the Discord SDK (authenticating, error, loading, pending, ready)
 */
export function useDiscordSdkSetup(options?: UseDiscordSdkSetupOptions) {
	const { authenticate } = options ?? {}
	const [accessToken, setAccessToken] = useState<string | null>(null)
	const [session, setSession] = useState<DiscordSession | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [status, setStatus] = useState<'authenticating' | 'error' | 'loading' | 'pending' | 'ready'>('pending')

	const setupDiscordSdk = useCallback(async () => {
		try {
			setStatus('loading')
			await discordSdk.ready()

			if (authenticate) {
				setStatus('authenticating')
				const { accessToken, auth } = await authenticateSdk({ scope: options?.scope })
				setAccessToken(accessToken)
				setSession(auth)
			}

			setStatus('ready')
		} catch (e) {
			console.error(e)
			if (e instanceof Error) {
				setError(e.message)
			} else {
				setError('An unknown error occurred')
			}
			setStatus('error')
		}
	}, [authenticate])

	useStableEffect(() => {
		setupDiscordSdk()
	})

	return { accessToken, authenticated: !!accessToken, discordSdk, error, session, status }
}

function useStableEffect(callback: () => void | Promise<void>) {
	const isRunning = useRef(false)

	useEffect(() => {
		if (!isRunning.current) {
			isRunning.current = true
			callback()
		}
	}, [])
}
