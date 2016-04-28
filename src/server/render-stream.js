import stream from 'stream'

const MAX_STACK_DEPTH = 500

/**
 * Original RenderStream implmentation by Sasha Aickin (@aickin)
 * Licensed under the Apache License, Version 2.0
 * Modified by Evan You (@yyx990803)
 */

export default class RenderStream extends stream.Readable {
  constructor (render) {
    super()
    this.buffer = ''
    this.render = render
  }

  _read (n) {
    let bufferToPush
    // it's possible that the last chunk added bumped the buffer up to > 2 * n,
    // which means we will need to go through multiple read calls to drain it
    // down to < n.
    if (this.done) {
      this.push(null)
      return
    }
    if (this.buffer.length >= n) {
      bufferToPush = this.buffer.substring(0, n)
      this.buffer = this.buffer.substring(n)
      this.push(bufferToPush)
      return
    }
    if (!this.next) {
      this.stackDepth = 0
      // start the rendering chain.
      this.render(
        // write
        (text, next) => {
          this.buffer += text
          if (this.buffer.length >= n) {
            this.next = next
            bufferToPush = this.buffer.substring(0, n)
            this.buffer = this.buffer.substring(n)
            this.push(bufferToPush)
          } else {
            // continue rendering until we have enough text to call this.push().
            // sometimes do this as process.nextTick to get out of stack overflows.
            if (this.stackDepth >= MAX_STACK_DEPTH) {
              process.nextTick(next)
            } else {
              this.stackDepth++
              next()
              this.stackDepth--
            }
          }
        },
        // done
        () => {
          // the rendering is finished; we should push out the last of the buffer.
          this.done = true
          this.push(this.buffer)
        })
    } else {
      // continue with the rendering.
      this.next()
    }
  }
}
