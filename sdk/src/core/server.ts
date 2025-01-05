import http from 'node:http'
import { Server as ColyseusServer, LobbyRoom } from '@colyseus/core'
import { MonitorOptions, monitor } from '@colyseus/monitor'
import { WebSocketTransport } from '@colyseus/ws-transport'
import { NodeEngine } from '@robojs/server/engines.js'
import express from 'express'
import { logger as defaultLogger } from 'robo.js'
import type { InitOptions, StartOptions } from '@robojs/server/engines.js'
import type { ViteDevServer } from 'vite'
import { TicTacToe } from '../rooms/TicTacToe.js'

const logger = defaultLogger.fork('server')

export class ColyseusServerEngine extends NodeEngine {
	private _colyseusServer: ColyseusServer | null = null
	private _colyseusHttpServer: http.Server | null = null

	public async init(options: InitOptions): Promise<void> {
		await super.init(options)
		this._init()

		this._colyseusServer!.define('lobby', LobbyRoom)
		this._colyseusServer!.define('tic_tac_toe', TicTacToe).enableRealtimeListing()
	}

	public setupVite(vite: ViteDevServer) {
		super.setupVite(vite)
		this._patchServerHandler()
	}

	public async start(options: StartOptions): Promise<void> {
		await super.start(options)
		this._colyseusHttpServer!.listen(options.port + 1)
	}

	public async stop(): Promise<void> {
		await super.stop()
		await this._colyseusServer?.gracefullyShutdown()
	}

	private _init() {
		this._patchServerHandler()

		const expressApp = express()
		this._colyseusHttpServer = http.createServer(expressApp)
		this._colyseusServer = new ColyseusServer({
			logger: defaultLogger.fork('colyseus'),
			transport: new WebSocketTransport({
				server: this._colyseusHttpServer!
			})
		})

		const colyseusMonitor = monitor(this._colyseusHttpServer as Partial<MonitorOptions>)
		expressApp.use('/colyseus', colyseusMonitor)
		this.registerWebsocket('default', (req, socket, head) => {
			this._colyseusHttpServer!.emit('upgrade', req, socket, head)
		})
	}

	private _patchServerHandler() {
		const oldHandler = this._serverHandler
		this._serverHandler = (req, res) => {
			if (req.url?.startsWith('/colyseus')) {
				logger.debug('Forwarding to Colyseus:', req.url)
				this._colyseusHttpServer!.emit('request', req, res)
				return
			}

			oldHandler?.(req, res)
		}
	}
}
