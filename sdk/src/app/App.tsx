import { DiscordContextProvider } from '../hooks/useDiscordSdk.js'
import { Activity } from './Activity.js'
import { LoadingScreen } from '../components/LoadingScreen.js'
import { GameContextProvider, PlayersContextProvider } from '../hooks/usePlayers.js'
import './global.css'
import { LobbiesContextProvider } from '../hooks/useLobbies.js'

export default function App() {
	return (
		<DiscordContextProvider
			authenticate
			loadingScreen={<LoadingScreen />}
			scope={['identify', 'guilds', 'guilds.members.read', 'rpc.voice.read']}
		>
			<GameContextProvider>
				<LobbiesContextProvider>
					<PlayersContextProvider>
						<Activity />
					</PlayersContextProvider>
				</LobbiesContextProvider>
			</GameContextProvider>
		</DiscordContextProvider>
	)
}
