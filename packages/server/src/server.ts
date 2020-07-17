import {CONTENT_TYPES, EMPTY_FN, HEADERS, STATUS_CODES, STATUS_MESSAGES,} from './constants'
import {
	createServer as createNativeServer,
	IncomingMessage,
	RequestListener,
	Server as NativeServer,
	ServerResponse,
} from 'http'
import {
	Context,
	ErrorHandler,
	Handler,
	isBuffer,
	isErrorStatusCode,
	isHttpError,
	isNativeError,
	isNativeServer,
	isPrimitive,
	isStream,
	Options,
} from './types'

const {assign} = Object
const {stringify} = JSON
const {byteLength} = Buffer

const defaultHandler: Handler = EMPTY_FN

const defaultErrorHandler: ErrorHandler = function defaultErrorHandler(err, ctx) {

	let statusCode: number

	if (isErrorStatusCode(err)) statusCode = err
	else if (isHttpError(err)) statusCode = err.code
	else statusCode = STATUS_CODES.INTERNAL_SERVER_ERROR

	let body: string

	if (typeof err === 'string' && err.length) body = err
	else if ((isHttpError(err) || isNativeError(err)) && err.message?.length) body = err.message
	else body = STATUS_MESSAGES[statusCode]!

	try {
		const {res} = ctx
		res.statusCode = statusCode
		res.body = body
		respond(ctx)
	} catch (err) {
		console.error(err)
	}
}

function respond({req, res}: Context) {

	const {NO_CONTENT, NOT_MODIFIED} = STATUS_CODES
	const {CONTENT_TYPE, CONTENT_LENGTH} = HEADERS
	const {STREAM, JSON, TEXT} = CONTENT_TYPES

	let type = res.getHeader(CONTENT_TYPE)
	let {body} = res

	if (isStream(body)) {
		res.setHeader(CONTENT_TYPE, type ?? STREAM)
		body.pipe(res)
		return
	}

	if (body === null) {
		res.statusCode = NO_CONTENT
		body = ''
	} else if (isPrimitive(body)) {
		body = String(body)
	} else if (isBuffer(body)) {
		type = type ?? STREAM
	} else if (typeof body === 'object') {
		body = stringify(body)
		type = type ?? JSON
	} else {
		body = STATUS_MESSAGES[res.statusCode]!
	}

	res.setHeader(CONTENT_TYPE, type ?? TEXT)
	res.setHeader(CONTENT_LENGTH, byteLength(body))

	const {statusCode} = res

	if (statusCode === NO_CONTENT || statusCode === NOT_MODIFIED) {
		res.removeHeader(CONTENT_TYPE)
		res.removeHeader(CONTENT_LENGTH)
		body = ''
	} else if (req.method === 'HEAD') {
		body = ''
	}

	res.end(body)
}

async function run(ctx: Context, handler: Handler, errorHandler: ErrorHandler): Promise<void> {
	try {
		const {res} = ctx
		res.body = await handler(ctx)
		if (res.writableEnded) return
		const {body} = res
		if (body === undefined) return errorHandler(STATUS_CODES.NOT_FOUND, ctx)
		if (typeof body === 'function') return run(ctx, body, errorHandler)
		respond(ctx)
	} catch (err) {
		errorHandler(err, ctx)
	}
}

function createContext(req: IncomingMessage, res: ServerResponse): Context {

	return {
		req: assign(req, {}),
		res: assign(res, {}),
	}
}

class Server {

	handler: Handler
	errorHandler: ErrorHandler
	nativeServer?: NativeServer

	requestListener: RequestListener = (req, res) => {
		setImmediate(() => run(createContext(req, res), this.handler, this.errorHandler))
	}

	constructor({handler, errorHandler, nativeServer}: Options = {}) {

		if (handler !== undefined && typeof handler !== 'function')
			throw TypeError('handler must be a function')
		if (errorHandler !== undefined && typeof errorHandler !== 'function')
			throw TypeError('error handler must be a function')
		if (nativeServer !== undefined && !isNativeServer(nativeServer))
			throw TypeError('invalid native server')

		this.handler = handler ?? defaultHandler
		this.errorHandler = errorHandler ?? defaultErrorHandler
		this.nativeServer = nativeServer
	}

	listen(...args: any[]) {
		return (this.nativeServer = this.nativeServer ?? createNativeServer())
			.on('request', this.requestListener)
			.listen(...args)
	}
}

function createServer(options?: Handler | Options) {
	if (typeof options === 'function') options = {handler: options}
	return new Server(options)
}

export {Server, createServer, respond}
