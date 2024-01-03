expect.extend({
  toHaveClass(el: Element, cls: string) {
    const pass = el.classList
      ? el.classList.contains(cls)
      : (el.getAttribute('class') || '').split(/\s+/g).indexOf(cls) > -1
    return {
      pass,
      message: () =>
        `Expected element${pass ? ' ' : ' not '}to have class ${cls}`
    }
  }
})
