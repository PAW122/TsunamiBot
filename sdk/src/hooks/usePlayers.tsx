import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Events } from '@discord/embedded-app-sdk'
import { GameName } from '../core/constants.js'
import { Player } from '../entities/Player.js'
import { State } from '../entities/State.js'
import { useDiscordSdk } from './useDiscordSdk.js'
import { discordSdk } from './useDiscordSdk.js'
import { Client, Room } from 'colyseus.js'
import { getUserAvatarUrl, getUserDisplayName } from '../utils/discord.js'
import type { IColyseus, IGuildsMembersRead } from '../core/types.js'

type TGameContext = { guildMember: IGuildsMembersRead | null } & Partial<IColyseus>

const GameContext = createContext<TGameContext>({
	guildMember: null,
	client: undefined,
	room: undefined
})

const PlayersContext = createContext<Player[]>([])

export function GameContextProvider({ children }: { children: React.ReactNode }) {
	const context = useGameContextSetup()

	return <GameContext.Provider value={context}>{children}</GameContext.Provider>
}

export function useGameContext() {
	return useContext(GameContext)
}

function useGameContextSetup() {
	const { accessToken, session } = useDiscordSdk()
	const isRunning = useRef(false)
	const [guildMember, setGuildMember] = useState<IGuildsMembersRead | null>(null)
	const [client, setClient] = useState<Client | undefined>(undefined)
	const [room, setRoom] = useState<Room<State> | undefined>(undefined)

	const setupGameContext = useCallback(async () => {
		const guildMember: IGuildsMembersRead | null = await fetch(
			`https://discord.com/api/users/@me/guilds/${discordSdk.guildId}/member`,
			{
				method: 'get',
				headers: { Authorization: `Bearer ${accessToken}` }
			}
		)
			.then((j) => j.json())
			.catch(() => {
				return null
			})

		const wsUrl = `wss://${location.host}/.proxy/colyseus`
		const client = new Client(wsUrl)

		let roomName = 'Channel'

		if (discordSdk.channelId != null && discordSdk.guildId != null) {
			const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId })
			if (channel.name != null) {
				roomName = channel.name
			}
		}

		const avatarUri = getUserAvatarUrl({
			guildMember,
			user: session!.user
		})

		const name = getUserDisplayName({
			guildMember,
			user: session!.user
		})

		const newRoom = await client.joinOrCreate<State>(GameName, {
			channelId: discordSdk.channelId,
			roomName,
			userId: session!.user.id,
			name,
			avatarUri
		})

		setGuildMember(guildMember)
		setClient(client)
		setRoom(newRoom)
	}, [accessToken, session])

	useEffect(() => {
		if (accessToken && session?.user && !isRunning.current) {
			isRunning.current = true
			setupGameContext()
		}
	}, [accessToken, session])

	return { guildMember, client, room }
}

export function PlayersContextProvider({ children }: { children: React.ReactNode }) {
	const players = usePlayersContextSetup()

	return <PlayersContext.Provider value={players}>{children}</PlayersContext.Provider>
}

export function usePlayers() {
	return useContext(PlayersContext)
}

function usePlayersContextSetup() {
	const [players, setPlayers] = useState<Player[]>([])
	const { room } = useGameContext()
	const isRunning = useRef(false)
	const { session } = useDiscordSdk()

	useEffect(() => {
		if (!room) {
			return
		}
		if (isRunning.current) {
			return
		}
		isRunning.current = true

		try {
			room.state.players.onAdd((player: Player) => {
				setPlayers((players) => [...players, player])

				player.listen('talking', (newValue: boolean) => {
					setPlayers((players) =>
						players.map((p) => {
							if (p.userId === player.userId) {
								p.talking = newValue
							}

							return p
						})
					)
				})
			})

			room.state.players.onRemove((player: Player) => {
				setPlayers((players) => [...players.filter((p) => p.userId !== player.userId)])
			})
		} catch (e) {
			console.error("Couldn't connect:", e)
		}
	}, [room])

	useEffect(() => {
		function handleSpeakingStart({ user_id }: { user_id: string }) {
			if (session?.user?.id === user_id) {
				room?.send('startTalking')
			}
		}
		function handleSpeakingStop({ user_id }: { user_id: string }) {
			if (session?.user?.id === user_id) {
				room?.send('stopTalking')
			}
		}

		discordSdk.subscribe(Events.SPEAKING_START, handleSpeakingStart, { channel_id: discordSdk.channelId })
		discordSdk.subscribe(Events.SPEAKING_STOP, handleSpeakingStop, { channel_id: discordSdk.channelId })
		return () => {
			discordSdk.unsubscribe(Events.SPEAKING_START, handleSpeakingStart)
			discordSdk.unsubscribe(Events.SPEAKING_STOP, handleSpeakingStop)
		}
	}, [room, session])

	return players
}
