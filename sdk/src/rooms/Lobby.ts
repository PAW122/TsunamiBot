import { Client, LobbyRoom } from '@colyseus/core'

export class Lobby extends LobbyRoom {
    async onCreate(_options: any) {
        console.log('Lobby created');
    }

    async onJoin(client: Client) {
        console.log('Client joined:', client.sessionId);
    }

    async onLeave(client: Client) {
        console.log('Client left:', client.sessionId);
    }
}
