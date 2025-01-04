import { DiscordContextProvider } from '../hooks/useDiscordSdk.js'
import { Activity } from './Activity.js'
import { LoadingScreen } from '../components/LoadingScreen.js'
import { GameContextProvider, PlayersContextProvider } from '../hooks/usePlayers.js'
import './global.css'

export default function App() {
	return (
		<DiscordContextProvider
			authenticate
			loadingScreen={<LoadingScreen />}
			scope={['identify', 'guilds', 'guilds.members.read', 'rpc.voice.read']}
		>
			<GameContextProvider>
				<PlayersContextProvider>
					<Activity />
				</PlayersContextProvider>
			</GameContextProvider>
		</DiscordContextProvider>
	)
}
