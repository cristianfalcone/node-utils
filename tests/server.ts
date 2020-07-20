import {suite} from 'uvu'
import * as assert from 'uvu/assert'
import * as request from 'supertest'
import {RequestListener} from 'http'
import {Server, createServer} from '../packages/server/src'

const test = suite('server')

type Header = [string, string]
const contentType = 'content-type'
const textHeader: Header = [contentType, 'text/plain; charset=utf-8']
const jsonHeader: Header = [contentType, 'application/json; charset=utf-8']

let app: Server
let listener: RequestListener

test.before(() => {
	app = createServer()
	listener = app.requestListener
})

test('requestListener is valid', () => {
	assert.type(listener, 'function')
	assert.is(listener.length, 2)
})

test('404 response by default', () => {
	return request(listener).get('/').expect(404)
})

test('end response early', () => {
	const body = 'foo'
	app.handler = ctx => ctx.res.end(body)
	return request(listener).get('/').expect(200, body)
})

test('function response', () => {
	app.handler = () => () => 'foo'
	return request(listener).get('/').expect(200, 'foo')
})

test('promise response', () => {
	app.handler = () => new Promise(resolve => resolve('foo')).then(r => r + 'bar')
	return request(listener).get('/').expect(200, 'foobar')
})

test('null response', () => {
	app.handler = () => null
	return request(listener).get('/').expect(204, '')
})

test('string response', () => {
	const body = 'foo'
	app.handler = () => body
	return request(listener).get('/').expect(200, body)
})

test('number response', () => {
	app.handler = () => 1
	return request(listener).get('/').expect(...textHeader).expect(200, '1')
})

test('boolean response', () => {
	app.handler = () => true
	return request(listener).get('/').expect(...textHeader).expect(200, 'true')
})

test('symbol response', () => {
	app.handler = () => Symbol('foo')
	return request(listener).get('/').expect(...textHeader).expect(200, 'Symbol(foo)')
})

test('object response', () => {
	app.handler = () => ({foo: 'bar'})
	return request(listener).get('/').expect(...jsonHeader).expect(200, '{"foo":"bar"}')
})

test.run()
