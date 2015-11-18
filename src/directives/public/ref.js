import { warn } from '../../util/index'

export default {
  bind () {
    process.env.NODE_ENV !== 'production' && warn(
      'v-ref:' + this.arg + ' must be used on a child ' +
      'component. Found on <' + this.el.tagName.toLowerCase() + '>.'
    )
  }
}
