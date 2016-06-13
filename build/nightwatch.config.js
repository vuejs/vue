// http://nightwatchjs.org/guide#settings-file
module.exports = {
  'src_folders': ['test/e2e/specs'],
  'output_folder': 'test/e2e/reports',
  'custom_commands_path': ['test/e2e/custom-commands'],
  'custom_assertions_path': ['test/e2e/custom-assertions'],

  'selenium': {
    'start_process': true,
    'server_path': 'node_modules/selenium-server/lib/runner/selenium-server-standalone-2.53.0.jar',
    'host': '127.0.0.1',
    'port': 4444,
    'cli_args': {
      'webdriver.chrome.driver': require('chromedriver').path
    }
  },

  'test_settings': {
    'default': {
      'selenium_port': 4444,
      'selenium_host': 'localhost',
      'silent': true,
      'screenshots': {
        'enabled': true,
        'on_failure': true,
        'on_error': false,
        'path': 'test/e2e/screenshots'
      }
    },

    'chrome': {
      'desiredCapabilities': {
        'browserName': 'chrome',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    },

    'firefox': {
      'desiredCapabilities': {
        'browserName': 'firefox',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    },

    'phantomjs': {
      'desiredCapabilities': {
        'browserName': 'phantomjs',
        'javascriptEnabled': true,
        'acceptSslCerts': true
      }
    }
  }
}
