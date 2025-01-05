import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Events } from '@discord/embedded-app-sdk'
import { Player } from '../entities/Player.js'
import { useDiscordSdk } from './useDiscordSdk.js'
import { discordSdk } from './useDiscordSdk.js'
import { Client, Room } from 'colyseus.js'
import type { IColyseus, IGuildsMembersRead } from '../core/types.js'
import { useLobbies } from './useLobbies.js'

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
	const [room, setRoom] = useState<Room | undefined>(undefined)

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

		const lobbyRoom = await client.joinOrCreate('lobby')

		setGuildMember(guildMember)
		setClient(client)
		setRoom(lobbyRoom)
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
	const { currentGame } = useLobbies()
	const isRunning = useRef(false)
	const { session } = useDiscordSdk()

	useEffect(() => {
		if (!currentGame) {
			isRunning.current = false
			setPlayers([])
			return
		}
		if (isRunning.current) return
		isRunning.current = true

		try {
			currentGame.state.players.onAdd((player: Player) => {
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

			currentGame.state.players.onRemove((player: Player) => {
				setPlayers((players) => [...players.filter((p) => p.userId !== player.userId)])
			})
		} catch (e) {
			console.error("Couldn't connect:", e)
		}
	}, [currentGame])

	useEffect(() => {
		function handleSpeakingStart({ user_id }: { user_id: string }) {
			if (session?.user?.id === user_id) {
				currentGame?.send('startTalking')
			}
		}
		function handleSpeakingStop({ user_id }: { user_id: string }) {
			if (session?.user?.id === user_id) {
				currentGame?.send('stopTalking')
			}
		}

		discordSdk.subscribe(Events.SPEAKING_START, handleSpeakingStart, { channel_id: discordSdk.channelId })
		discordSdk.subscribe(Events.SPEAKING_STOP, handleSpeakingStop, { channel_id: discordSdk.channelId })
		return () => {
			discordSdk.unsubscribe(Events.SPEAKING_START, handleSpeakingStart)
			discordSdk.unsubscribe(Events.SPEAKING_STOP, handleSpeakingStop)
		}
	}, [currentGame, session])

	return players
}
