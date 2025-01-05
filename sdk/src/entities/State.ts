import { Schema, MapSchema, type } from '@colyseus/schema'
import { TPlayerOptions, Player } from './Player.js'

export interface IState {
	roomName: string,
	maxPlayers: number,
	gridSize: number
}

export class State extends Schema {
	@type({ map: Player })
	players = new MapSchema<Player>()
	@type({ map: Player })
	observers = new MapSchema<Player>()

	@type('string')
	public roomName: string
	@type('number')
	public maxPlayers: number
	@type('number')
	public gridSize: number

	@type('string')
	public state: 'waiting_for_players' | 'playing' | 'ended' = 'waiting_for_players'

	constructor(attributes: IState) {
		super()
		this.roomName = attributes.roomName
		this.maxPlayers = attributes.maxPlayers
		this.gridSize = attributes.gridSize
	}

	private _getPlayer(sessionId: string): Player | undefined {
		return Array.from(this.players.values()).find((p) => p.sessionId === sessionId)
	}

	createPlayer(sessionId: string, playerOptions: TPlayerOptions) {
		if (this.players.size >= this.maxPlayers) {
			this.observers.set(playerOptions.userId, new Player({ ...playerOptions, sessionId }))
			return
		}
		const existingPlayer = Array.from(this.players.values()).find((p) => p.sessionId === sessionId)
		if (existingPlayer == null) {
			this.players.set(playerOptions.userId, new Player({ ...playerOptions, sessionId }))

			if (this.players.size === this.maxPlayers) {
				this.state = 'playing'
			}
		}
	}

	removePlayer(sessionId: string) {
		const player = Array.from(this.players.values()).find((p) => p.sessionId === sessionId)
		if (player != null) {
			this.players.delete(player.userId)
		}

		const observer = Array.from(this.observers.values()).find((p) => p.sessionId === sessionId)
		if (observer != null) {
			this.observers.delete(observer.userId)
		}
	}

	startTalking(sessionId: string) {
		const player = this._getPlayer(sessionId)
		if (player != null) {
			player.talking = true
		}
	}

	stopTalking(sessionId: string) {
		const player = this._getPlayer(sessionId)
		if (player != null) {
			player.talking = false
		}
	}
}
