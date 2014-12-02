var sauceConfig = {
  testName: 'Vue.js unit tests',
  recordScreenshots: false,
  build: process.env.TRAVIS_JOB_ID || Date.now(),
}

/**
 * Having too many tests running concurrently on saucelabs
 * causes timeouts and errors, so we have to run them in
 * smaller batches.
 */

var batches = [
  // the cool kids
  {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '39'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '33'
    },
    sl_mac_safari: {
      base: 'SauceLabs',
      browserName: "safari",
      platform: "OS X 10.10",
      version: "8"
    }
  },
  // ie family
  {
    sl_ie_9: {
      base: 'SauceLabs',
      browserName: "internet explorer",
      platform: "Windows 7",
      version: "9"
    },
    sl_ie_10: {
      base: 'SauceLabs',
      browserName: "internet explorer",
      platform: "Windows 8",
      version: "10"
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    }
  },
  // mobile
  {
    sl_ios_safari: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.9',
      version: '8.1'
    },
    sl_android: {
      base: 'SauceLabs',
      browserName: 'android',
      platform: 'Linux',
      version: '4.2'
    }
  }
]

for (var i = 0; i < 3; i++) {
  exports['batch' + (i+1)] = {
    sauceLabs: sauceConfig,
    // mobile emulators are really slow
    captureTimeout: 300000,
    browserNoActivityTimeout: 300000,
    customLaunchers: batches[i],
    browsers: Object.keys(batches[i]),
    reporters: ['progress', 'saucelabs']
  }
}