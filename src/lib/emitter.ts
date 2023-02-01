import { EventEmitter } from 'node:events'

class MyEmitter extends EventEmitter {}

export const memberEmitter = new MyEmitter()
