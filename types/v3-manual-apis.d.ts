import { SetupContext } from './v3-setup-context'
import { CreateElement, Vue } from './vue'

export function getCurrentInstance(): { proxy: Vue } | null

export const h: CreateElement

export function useAttrs(): SetupContext['attrs']

export function useSlots(): SetupContext['slots']
