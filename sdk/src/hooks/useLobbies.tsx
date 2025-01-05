import { createContext, useContext, useEffect, useState } from 'react'
import { getUserAvatarUrl, getUserDisplayName } from '../utils/discord.js'
import { discordSdk, useDiscordSdk } from './useDiscordSdk.js'
import { useGameContext } from './usePlayers.js'
import { Room } from 'colyseus.js'
import { State } from '../entities/State.js'

type LobbiesContextType = {
	games: Room[]
	currentGame: Room<State> | null
	joinGame: (id: string) => Promise<void>
	createGame: () => Promise<void>
	leaveGame: () => Promise<void>
}

const LobbiesContext = createContext<LobbiesContextType | undefined>(undefined)

export function LobbiesContextProvider({ children }: { children: React.ReactNode }) {
	const { session } = useDiscordSdk()
	const { client, room, guildMember } = useGameContext()
	const [games, setGames] = useState<Room<State>[]>([])
	const [currentGame, setCurrentGame] = useState<Room<State> | null>(null)

	const getPlayerData = async () => {
		const avatarUri = getUserAvatarUrl({
			guildMember,
			user: session!.user
		})

		const name = getUserDisplayName({
			guildMember,
			user: session!.user
		})

		let roomName = `${name}'s game`

		return {
			channelId: discordSdk.channelId,
			roomName,
			userId: session!.user.id,
			name,
			avatarUri
		}
	}

	useEffect(() => {
		if (!room) return

		room.onMessage('rooms', (r: Room[]) => {
			setGames(r)
		})

		room.onMessage('+', ([roomId, room]) => {
			if (games.find((r) => r.roomId === roomId)) {
				return
			}
			setGames([...games, room])
		})

		room.onMessage('-', (roomId) => {
			setGames(games.filter((room) => room.roomId !== roomId))
		})
	}, [room])

	const joinGame = async (id: string) => {
		if (currentGame) return

		const playerData = await getPlayerData()
		const game: Room | undefined = await client?.joinById(id, playerData)
		if (game) {
			setCurrentGame(game)
		}
	}

	const createGame = async () => {
		if (currentGame) return

		const playerData = await getPlayerData()
		const game: Room | undefined = await client?.create('tic_tac_toe', playerData)
		if (game) {
			setCurrentGame(game)
		}
	}

	const leaveGame = async () => {
		if (currentGame != null) {
			await currentGame.leave()
			setCurrentGame(null)
		}
	}

	return (
		<LobbiesContext.Provider value={{ games, currentGame, joinGame, createGame, leaveGame }}>
			{children}
		</LobbiesContext.Provider>
	)
}

export function useLobbies() {
	const context = useContext(LobbiesContext)
	if (!context) {
		throw new Error('useLobbies must be used within a LobbiesContextProvider')
	}
	return context
}
