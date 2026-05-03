import { isRegExp, isArray, remove, isPrimitive } from 'shared/util'
import { getFirstComponentChild } from 'core/vdom/helpers/index'
import type VNode from 'core/vdom/vnode'
import type { VNodeComponentOptions, VNodeData } from 'types/vnode'
import type { Component } from 'types/component'
import { getComponentName } from '../vdom/create-component'

type CacheEntry = {
  name?: string
  tag?: string
  componentInstance?: Component
  metaKey?: string | number | symbol
}

type CacheEntryMap = Record<string, CacheEntry | null>

type MatchKey = string | number | symbol

function _getComponentName(opts?: VNodeComponentOptions): string | null {
  return opts && (getComponentName(opts.Ctor.options as any) || opts.tag)
}

function _getMetaKey(vnodeData: VNodeData | undefined, metaKey: string | symbol): MatchKey | null {
  if (!vnodeData || !vnodeData.meta) return null
  const value = (vnodeData.meta as any)[metaKey]
  if (value == null) return null
  if (isPrimitive(value)) {
    return value as MatchKey
  }
  return null
}

function matches(
  pattern: string | RegExp | Array<string | number | symbol>,
  key: MatchKey
): boolean {
  if (isArray(pattern)) {
    return pattern.indexOf(key as any) > -1
  } else if (typeof pattern === 'string') {
    if (typeof key === 'string') {
      return pattern.split(',').indexOf(key) > -1
    }
    return false
  } else if (isRegExp(pattern)) {
    if (typeof key === 'string' || typeof key === 'number') {
      return pattern.test(String(key))
    }
    return false
  }
  /* istanbul ignore next */
  return false
}

function pruneCache(
  keepAliveInstance: {
    cache: CacheEntryMap
    keys: string[]
    _vnode: VNode
    $vnode: VNode
    metaKey?: string | symbol
  },
  filter: (name?: string, metaKey?: MatchKey) => boolean
) {
  const { cache, keys, _vnode, $vnode } = keepAliveInstance
  for (const key in cache) {
    const entry = cache[key]
    if (entry) {
      if (!filter(entry.name, entry.metaKey)) {
        pruneCacheEntry(cache, key, keys, _vnode)
      }
    }
  }
  $vnode.componentOptions!.children = undefined
}

function pruneCacheEntry(
  cache: CacheEntryMap,
  key: string,
  keys: Array<string>,
  current?: VNode
) {
  const entry = cache[key]
  if (entry && (!current || entry.tag !== current.tag)) {
    // @ts-expect-error can be undefined
    entry.componentInstance.$destroy()
  }
  cache[key] = null
  remove(keys, key)
}

const patternTypes: Array<Function> = [String, RegExp, Array]

// TODO defineComponent
export default {
  name: 'keep-alive',
  abstract: true,

  props: {
    include: patternTypes,
    exclude: patternTypes,
    max: [String, Number],
    metaKey: [String, Symbol]
  },

  methods: {
    cacheVNode() {
      const { cache, keys, vnodeToCache, keyToCache, metaKey } = this
      if (vnodeToCache) {
        const { tag, componentInstance, componentOptions, data } = vnodeToCache
        const entryMetaKey = metaKey
          ? _getMetaKey(data, metaKey)
          : undefined
        cache[keyToCache] = {
          name: _getComponentName(componentOptions),
          tag,
          componentInstance,
          metaKey: entryMetaKey
        }
        keys.push(keyToCache)
        // prune oldest entry
        if (this.max && keys.length > parseInt(this.max)) {
          pruneCacheEntry(cache, keys[0], keys, this._vnode)
        }
        this.vnodeToCache = null
      }
    }
  },

  created() {
    this.cache = Object.create(null)
    this.keys = []
  },

  destroyed() {
    for (const key in this.cache) {
      pruneCacheEntry(this.cache, key, this.keys)
    }
  },

  mounted() {
    this.cacheVNode()
    this.$watch('include', val => {
      pruneCache(this, (name, metaKey) => {
        if (this.metaKey && metaKey != null) {
          return matches(val, metaKey)
        }
        if (name) {
          return matches(val, name)
        }
        return true
      })
    })
    this.$watch('exclude', val => {
      pruneCache(this, (name, metaKey) => {
        if (this.metaKey && metaKey != null) {
          return !matches(val, metaKey)
        }
        if (name) {
          return !matches(val, name)
        }
        return true
      })
    })
  },

  updated() {
    this.cacheVNode()
  },

  render() {
    const slot = this.$slots.default
    const vnode = getFirstComponentChild(slot)
    const componentOptions = vnode && vnode.componentOptions
    if (componentOptions) {
      const { include, exclude, metaKey } = this
      const vnodeData = vnode.data

      // Priority 1: Explicit vnode.data.keepAlive control (highest priority)
      // This allows dynamic control via vnode data (e.g., from vue-router meta)
      // When vnode.data.keepAlive === false: explicitly skip caching
      // When vnode.data.keepAlive === true: explicitly enable caching
      // When undefined or null: continue to other checks
      if (vnodeData && vnodeData.keepAlive === false) {
        return vnode
      }
      if (vnodeData && vnodeData.keepAlive === true) {
        // Explicitly enabled, skip include/exclude checks
      } else {
        // Priority 2: Check by metaKey (if specified)
        // This allows matching based on route meta information
        if (metaKey) {
          const currentMetaKey = _getMetaKey(vnodeData, metaKey)
          if (
            // not included by metaKey
            (include && (currentMetaKey == null || !matches(include, currentMetaKey))) ||
            // excluded by metaKey
            (exclude && currentMetaKey != null && matches(exclude, currentMetaKey))
          ) {
            return vnode
          }
        } else {
          // Priority 3: Check by component name (default behavior)
          const name = _getComponentName(componentOptions)
          if (
            // not included
            (include && (!name || !matches(include, name))) ||
            // excluded
            (exclude && name && matches(exclude, name))
          ) {
            return vnode
          }
        }
      }

      const { cache, keys } = this
      const key =
        vnode.key == null
          ? // same constructor may get registered as different local components
            // so cid alone is not enough (#3269)
            componentOptions.Ctor.cid +
            (componentOptions.tag ? `::${componentOptions.tag}` : '')
          : vnode.key
      if (cache[key]) {
        vnode.componentInstance = cache[key].componentInstance
        // make current key freshest
        remove(keys, key)
        keys.push(key)
      } else {
        // delay setting the cache until update
        this.vnodeToCache = vnode
        this.keyToCache = key
      }

      // @ts-expect-error can vnode.data can be undefined
      vnode.data.keepAlive = true
    }
    return vnode || (slot && slot[0])
  }
}
