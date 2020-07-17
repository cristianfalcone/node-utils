import {IncomingMessage, Server as NativeServer, ServerResponse, STATUS_CODES} from 'http'
import {types} from 'util'
import {Stream} from 'stream'

interface Request extends IncomingMessage {
}

interface Response extends ServerResponse {
	body?: ResponseBody
}

type Context = { req: Request, res: Response }
type Handler = Function | { (ctx: Context): ResponseBody }
type HttpError = { code: number, message?: string }
type ErrorHandler = (err: number | string | HttpError | Error, ctx: Context) => void
type Options = { nativeServer?: NativeServer, handler?: Handler, errorHandler?: ErrorHandler }
type ResponseBody = Primitive | object | Promise<ResponseBody> | Handler | null | undefined
type Primitive = string | number | bigint | boolean | symbol

const {keys} = Object
const {isBuffer} = Buffer
const {isNativeError} = types
const primitives = ['string', 'number', 'bigint', 'boolean', 'symbol']
const isPrimitive = (val: any): val is Primitive => primitives.includes(typeof val)
const isObject = (val: any): val is Object => val !== null && typeof val === 'object'
const isStream = (obj: any): obj is Stream => isObject(obj) && typeof obj.pipe === 'function'
const isNativeServer = (obj: any): obj is NativeServer => isObject(obj) && typeof obj.on === 'function' && typeof obj.listen === 'function'
const isStatusCode = (val: any): val is number => typeof val === 'number' && keys(STATUS_CODES).includes(String(val))
const isErrorStatusCode = (val: any): val is number => isStatusCode(val) && val >= 400
const isHttpError = (obj: any): obj is HttpError => isObject(obj) && isErrorStatusCode(obj.code)

export {
	Context,
	ErrorHandler,
	Handler,
	HttpError,
	isBuffer,
	isErrorStatusCode,
	isHttpError,
	isNativeError,
	isNativeServer,
	isObject,
	isPrimitive,
	isStream,
	Options,
}
