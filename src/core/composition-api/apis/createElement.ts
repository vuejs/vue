import Vue from 'vue'
import { getVueConstructor, getCurrentInstance } from '../runtimeContext'
import { defineComponentInstance } from '../utils/helper'
import { warn } from '../utils'

type CreateElement = Vue['$createElement']

let fallbackCreateElement: CreateElement

export const createElement = (function createElement(...args: any) {
  const instance = getCurrentInstance()?.proxy
  if (!instance) {
    warn('`createElement()` has been called outside of render function.')
    if (!fallbackCreateElement) {
      fallbackCreateElement = defineComponentInstance(getVueConstructor())
        .$createElement
    }

    return fallbackCreateElement.apply(fallbackCreateElement, args)
  }

  return instance.$createElement.apply(instance, args)
} as any) as CreateElement
