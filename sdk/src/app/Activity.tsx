import { useLobbies } from '../hooks/useLobbies.js'
import { usePlayers } from '../hooks/usePlayers.js'
import { Player } from '../components/Player'

export const Activity = () => {
	const { games, currentGame, createGame, joinGame, leaveGame } = useLobbies()
	const players = usePlayers()

	return currentGame != null ? (
		<div>
			<h3>Game: {currentGame.id}</h3>

			<code>
				<pre>{JSON.stringify(currentGame.state.toJSON(), null, 2)}</pre>
			</code>

			{players.map((p) => (
				<Player key={p.userId} {...p} />
			))}

			<button onClick={leaveGame}>Leave</button>
		</div>
	) : (
		<div className="bg-slate-800 min-h-screen p-6 font-cartoon text-gray-300">
			<h1 className="text-4xl font-bold text-center text-blue-600">Ultimate Tic Tac Toe</h1>
			<div className="mt-8">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-semibold">Available Lobbies</h2>
					<button
						onClick={() => createGame()}
						className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 shadow-lg transform transition"
					>
						+ Create Lobby
					</button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{games.map((lobby) => {
						const metadata = (lobby as any).metadata
						return (
							<div
								key={lobby.roomId}
								className="bg-white rounded-lg shadow-md p-4 border-4 border-yellow-300 hover:border-yellow-500 transform hover:scale-105 transition"
							>
								<h3 className="text-xl font-bold text-purple-600">{metadata.roomName}</h3>
								<p className="text-sm text-gray-500">
									Players: {metadata.players} / {metadata.maxPlayers}
								</p>
								<p className="text-sm text-gray-500">
									Grid: {metadata.gridSize} | Observers: {metadata.observers}
								</p>
								<button
									onClick={() => joinGame(lobby.roomId)}
									className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 shadow-lg transform transition float-end"
								>
									Join
								</button>
							</div>
						)
					})}
				</div>
			</div>
		</div>
	)
}
