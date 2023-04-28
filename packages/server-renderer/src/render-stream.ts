/**
 * Original RenderStream implementation by Sasha Aickin (@aickin)
 * Licensed under the Apache License, Version 2.0
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Modified by Evan You (@yyx990803)
 */

// const stream = require('stream')
import { Readable } from 'stream'

import { isTrue, isUndef } from 'shared/util'
import { createWriteFunction } from './write'

export default class RenderStream extends Readable {
  private buffer: string = '';
  private readonly renderComponent: (write: Function, done: Function) => void;
  private expectedSize: number = 0;
  private nextFunction: Function | undefined;
  private readonly endFunction: Function;
  private isDone: boolean = false;

  constructor(renderComponent: (write: Function, done: Function) => void) {
    super({ highWaterMark: 16 }); // set highWaterMark to improve performance
    this.renderComponent = renderComponent;
    this.endFunction = () => {
      this.emit('beforeEnd');
      // the rendering is finished; we should push out the last of the buffer.
      this.isDone = true;
      this.push(this.buffer);
    };
  }

  private pushBySize(n: number): void {
    const bufferToPush = this.buffer.substring(0, n);
    this.buffer = this.buffer.substring(n);
    this.push(bufferToPush);
  }

  private writeFunction = createWriteFunction(
    (text, next) => {
      const n = this.expectedSize;
      this.buffer += text;
      if (this.buffer.length >= n) {
        this.nextFunction = next;
        this.pushBySize(n);
        return true; // we will decide when to call next
      }
      return false;
    },
    (err: Error) => {
      this.emit('error', err);
    }
  );

  private tryRender(): void {
    try {
      this.renderComponent(this.writeFunction, this.endFunction);
    } catch (e) {
      this.emit('error', e);
    }
  }

  private tryNext(): void {
    try {
      this.nextFunction!();
    } catch (e) {
      this.emit('error', e);
    }
  }

  _read(n: number):void {
    this.expectedSize = n
    // it's possible that the last chunk added bumped the buffer up to > 2 * n,
    // which means we will need to go through multiple read calls to drain it
    // down to < n.
    if (isTrue(this.isDone)) {
      this.push(null)
      return
    }
    if (this.buffer.length >= n) {
      this.pushBySize(n)
      return
    }
    if (isUndef(this.nextFunction)) {
      // start the rendering chain.
      this.tryRender()
    } else {
      // continue with the rendering.
      this.tryNext()
    }
  }
}
