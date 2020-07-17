import {STATUS_CODES as STATUS_MESSAGES} from 'http'

const CONTENT_TYPES = {
	HTML: 'text/html; charset=utf-8',
	JSON: 'application/json; charset=utf-8',
	STREAM: 'application/octet-stream',
	TEXT: 'text/plain; charset=utf-8',
}

const HEADERS = {
	CONTENT_LENGTH: 'content-length',
	CONTENT_TYPE: 'content-type',
}

const EMPTY_FN = function noop() {
}

const STATUS_CODES = {
	NO_CONTENT: 204,
	NOT_MODIFIED: 304,
	NOT_FOUND: 404,
	INTERNAL_SERVER_ERROR: 500,
}

export {
	CONTENT_TYPES,
	HEADERS,
	EMPTY_FN,
	STATUS_CODES,
	STATUS_MESSAGES,
}
