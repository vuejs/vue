import Vue, { AsyncComponent, Component } from "../index";

const a: AsyncComponent = () => ({
  component: new Promise<Component>((res, rej) => {
    res({ template: "" })
  })
})

const b: AsyncComponent = () => ({
  component: () =>
    new Promise<Component>((res, rej) => {
      res({ template: "" })
    })
})

const c: AsyncComponent = () =>
  new Promise<Component>((res, rej) => {
    res({
      template: ""
    })
  })

const d: AsyncComponent = () =>
  new Promise<{ default: Component }>((res, rej) => {
    res({
      default: {
        template: ""
      }
    })
  })

const e: AsyncComponent = () => ({
  component: new Promise<{ default: Component }>((res, rej) => {
    res({
      default: {
        template: ""
      }
    })
  })
})

// Test that Vue.component accepts any AsyncComponent
Vue.component("async-compponent1", a)
