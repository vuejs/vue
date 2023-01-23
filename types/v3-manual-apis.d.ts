import { SetupContext } from './v3-setup-context'
import { CreateElement, Vue } from './vue'

export function getCurrentInstance(): { proxy: Vue } | null

export function setCurrentInstance(vm?: Vue | null): void

export const h: CreateElement

export function useSlots(): SetupContext['slots']
export function useAttrs(): SetupContext['attrs']
export function useListeners(): SetupContext['listeners']
