import Vue from 'vue'
import { getVueConstructor } from '../runtimeContext'

type NextTick = Vue['$nextTick']

export const nextTick: NextTick = function nextTick(
  this: ThisType<NextTick>,
  ...args: Parameters<NextTick>
) {
  return getVueConstructor()?.nextTick.apply(this, args)
} as any
