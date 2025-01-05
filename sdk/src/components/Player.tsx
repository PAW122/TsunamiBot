import type { TPlayerOptions } from '../entities/Player'

export function Player({ avatarUri, name, talking }: TPlayerOptions) {
	return (
		<div className="flex items-center">
			<div className={`rounded-md ${talking ? 'border-green-500 border-2' : ''}`}>
				<img className="w-8 h-8" src={avatarUri} />
			</div>
			<div>{name}</div>
		</div>
	)
}
