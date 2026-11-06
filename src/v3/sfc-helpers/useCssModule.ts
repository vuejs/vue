import { emptyObject, warn } from '../../core/util'
import { currentInstance } from '../currentInstance'

export function useCssModule(name = '$style'): Record<string, string> {
  /* istanbul ignore else */
  if (!__GLOBAL__) {
    if (!currentInstance) {
      __DEV__ && warn(`useCssModule must be called inside setup()`)
      return emptyObject
    }
    const mod = currentInstance[name]
    if (!mod) {
      __DEV__ &&
        warn(`Current instance does not have CSS module named "${name}".`)
      return emptyObject
    }
    return mod as Record<string, string>
  } else {
    if (__DEV__) {
      warn(`useCssModule() is not supported in the global build.`)
    }
    return emptyObject
  }
}
