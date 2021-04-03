import { getCurrentInstance } from '../runtimeContext'
import { warn as vueWarn } from '../utils'

/**
 * Displays a warning message (using console.error) with a stack trace if the
 * function is called inside of active component.
 *
 * @param message warning message to be displayed
 */
export function warn(message: string) {
  vueWarn(message, getCurrentInstance()?.proxy)
}
