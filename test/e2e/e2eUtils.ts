import path from 'path'
import puppeteer from 'puppeteer'

export function getExampleUrl(
  name: string,
  apiType: 'classic' | 'composition'
) {
  const file = apiType === 'composition' ? `${name}.html` : `${name}/index.html`
  return `file://${path.resolve(
    __dirname,
    `../../examples/${apiType}/${file}`
  )}`
}

export const E2E_TIMEOUT = 30 * 1000

const puppeteerOptions = process.env.CI
  ? { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
  : { headless: !process.env.DEBUG }

const maxTries = 30
export const timeout = (n: number) => new Promise(r => setTimeout(r, n))

export async function expectByPolling(
  poll: () => Promise<any>,
  expected: string
) {
  for (let tries = 0; tries < maxTries; tries++) {
    const actual = (await poll()) || ''
    if (actual.indexOf(expected) > -1 || tries === maxTries - 1) {
      expect(actual).toMatch(expected)
      break
    } else {
      await timeout(50)
    }
  }
}

export function setupPuppeteer() {
  let browser: puppeteer.Browser
  let page: puppeteer.Page

  beforeAll(async () => {
    browser = await puppeteer.launch(puppeteerOptions)
  })

  beforeEach(async () => {
    page = await browser.newPage()

    await page.evaluateOnNewDocument(() => {
      localStorage.clear()
    })

    page.on('console', e => {
      if (e.type() === 'error') {
        const err = e.args()[0]
        console.error(
          `Error from Puppeteer-loaded page:\n`,
          err._remoteObject.description
        )
      }
    })
  })

  afterEach(async () => {
    await page.close()
  })

  afterAll(async () => {
    await browser.close()
  })

  async function click(selector: string, options?: puppeteer.ClickOptions) {
    await page.click(selector, options)
  }

  async function count(selector: string) {
    return (await page.$$(selector)).length
  }

  async function text(selector: string) {
    return await page.$eval(selector, node => node.textContent)
  }

  async function value(selector: string) {
    return await page.$eval(selector, node => (node as HTMLInputElement).value)
  }

  async function html(selector: string) {
    return await page.$eval(selector, node => node.innerHTML)
  }

  async function classList(selector: string) {
    return await page.$eval(selector, (node: any) => [...node.classList])
  }

  async function childrenCount(selector: string) {
    return await page.$eval(selector, (node: any) => node.children.length)
  }

  async function isVisible(selector: string) {
    const display = await page.$eval(selector, node => {
      return window.getComputedStyle(node).display
    })
    return display !== 'none'
  }

  async function isChecked(selector: string) {
    return await page.$eval(
      selector,
      node => (node as HTMLInputElement).checked
    )
  }

  async function isFocused(selector: string) {
    return await page.$eval(selector, node => node === document.activeElement)
  }

  async function setValue(selector: string, value: string) {
    await page.$eval(
      selector,
      (node, value) => {
        ;(node as HTMLInputElement).value = value as string
        node.dispatchEvent(new Event('input'))
      },
      value
    )
  }

  async function typeValue(selector: string, value: string) {
    const el = (await page.$(selector))!
    await el.evaluate(node => ((node as HTMLInputElement).value = ''))
    await el.type(value)
  }

  async function enterValue(selector: string, value: string) {
    const el = (await page.$(selector))!
    await el.evaluate(node => ((node as HTMLInputElement).value = ''))
    await el.type(value)
    await el.press('Enter')
  }

  async function clearValue(selector: string) {
    return await page.$eval(
      selector,
      node => ((node as HTMLInputElement).value = '')
    )
  }

  function timeout(time: number) {
    return page.evaluate(time => {
      return new Promise(r => {
        setTimeout(r, time)
      })
    }, time)
  }

  function nextFrame() {
    return page.evaluate(() => {
      return new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve)
        })
      })
    })
  }

  return {
    page: () => page,
    click,
    count,
    text,
    value,
    html,
    classList,
    childrenCount,
    isVisible,
    isChecked,
    isFocused,
    setValue,
    typeValue,
    enterValue,
    clearValue,
    timeout,
    nextFrame
  }
}
