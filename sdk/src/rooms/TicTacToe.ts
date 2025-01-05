import { Client, Room } from '@colyseus/core'
import { State, IState } from '../entities/State.js'
import { TPlayerOptions } from '../entities/Player.js'

export class TicTacToe extends Room<State> {
    maxClients = 1000

    onCreate(options: IState) {
        this.setState(new State(options))
        this.setMetadata({
            roomName: this.state.roomName,
            players: 1,
            observers: 0,
            maxPlayers: this.state.maxPlayers,
            gridSize: this.state.gridSize
        })

        this.onMessage('startTalking', (client, _data) => {
            this.state.startTalking(client.sessionId)
        })
        this.onMessage('stopTalking', (client, _data) => {
            this.state.stopTalking(client.sessionId)
        })

        console.log("CREATED GAME WITH ID: ", this.roomId);
    }

    onJoin(client: Client, options: TPlayerOptions) {
        this.state.createPlayer(client.sessionId, options)
        console.log(`GAME: ${client.sessionId} joined!`);
    }

    onLeave(client: Client) {
        this.state.removePlayer(client.sessionId)
        console.log(`GAME: ${client.sessionId} left!`);
    }

    onDispose() {
        console.log(`GAME: ${this.roomId} disposed!`);
    }
}
