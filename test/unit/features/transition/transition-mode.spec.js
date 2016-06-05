import Vue from 'vue'
import injectStyles from './inject-styles'
import { isIE9 } from 'web/util/index'
import { nextFrame } from 'web/runtime/modules/transition'

if (!isIE9) {
  describe('Transition mode', () => {
    it('dynamic components, simultaneous', done => {

    })

    it('dynamic components, out-in', done => {

    })

    it('dynamic components, in-out', done => {

    })

    it('normal elements with different key, simultaneous', done => {

    })

    it('normal elements with different key, out-in', done => {

    })

    it('normal elements with different key, in-out', done => {

    })
  })
}
