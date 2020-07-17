import { suite } from 'uvu'
import * as assert from 'uvu/assert'
import { agent } from 'supertest'
import { Server as NativeServer } from 'http'
import { Server, createServer } from '../packages/server/src'

const test = suite('server')

type Header = [string, string]
const contentType = 'content-type'
const textHeader: Header = [contentType, 'text/plain; charset=utf-8']
const jsonHeader: Header = [contentType, 'application/json; charset=utf-8']

let app: Server
let server: NativeServer

test.before(() => {
	app = createServer()
	server = app.listen()
})

test.after(() => {
	server.unref()
})

test('requestListener is valid', () => {
	assert.type(app.requestListener, 'function')
	assert.is(app.requestListener.length, 2)
})

test('404 response by default', () => {
	return agent(server).get('/').expect(404)
})

test('end response early', () => {
	const body = 'foo'
	app.handler = ctx => ctx.res.end(body)
	return agent(server).get('/').expect(200, body)
})

test('function response', () => {
	const body = () => 'foo'
	app.handler = () => body
	return agent(server).get('/').expect(200, 'foo')
})

test('promise response', () => {
	const body = () => new Promise(resolve => resolve('foo')).then(r => r + 'bar')
	app.handler = () => body
	return agent(server).get('/').expect(200, 'foobar')
})

test('null response', () => {
	app.handler = () => null
	return agent(server).get('/').expect(204, '')
})

test('string response', () => {
	const body = 'foo'
	app.handler = () => body
	return agent(server).get('/').expect(200, body)
})

test('number response', () => {
	app.handler = () => 1
	return agent(server).get('/').expect(...textHeader).expect(200, '1')
})

test('boolean response', () => {
	app.handler = () => true
	return agent(server).get('/').expect(...textHeader).expect(200, 'true')
})

test('symbol response', () => {
	app.handler = () => Symbol('foo')
	return agent(server).get('/').expect(...textHeader).expect(200, 'Symbol(foo)')
})

test('object response', () => {
	app.handler = () => ({ foo: 'bar' })
	return agent(server).get('/').expect(...jsonHeader).expect(200, '{"foo":"bar"}')
})

test.run()
