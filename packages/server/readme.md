# Server

Fast and dependency-free Node.js native server wrapper.

## Install

```
$ npm install @cristianfalcone/server
```
```
$ yarn add @cristianfalcone/server
```

## Usage

```js
import { createServer } from '@cristianfalcone/server';

createServer(() => 'Hello World!').listen(3000);
```
