# Server

Fast and dependency-free Node.js native server wrapper.

<a href="https://npmjs.org/package/@cristianfalcone/server">
    <img src="https://flat.badgen.net/npm/v/@cristianfalcone/server" alt="version" />
</a>
<a href="https://packagephobia.now.sh/result?p=@cristianfalcone/server">
    <img src="https://flat.badgen.net/packagephobia/install/@cristianfalcone/server" alt="install size" />
</a>

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
