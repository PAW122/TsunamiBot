export const LoadingScreen = () => {
	return (
		<div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900">
			<div className="w-16 h-16 border-4 border-blue-800 border-dashed rounded-full animate-spin"></div>
			<p className="mt-4 text-white text-lg font-semibold text-center">Loading Game</p>
		</div>
	)
}
