import TemplateRenderer from 'server/template-renderer/index'

describe('TemplateRenderer - renderScripts', () => {
  const clientManifestMock = {
    publicPath: '/dist',
    all: ['hello'],
    initial: [],
    async: ['hello.js'],
    modules: {
      'hello': [1],
    },
  }

  it('works if initial array is empty', () => {
    const templateRenderer = new TemplateRenderer({
      clientManifest: clientManifestMock
    })

    // mock getUsedAsyncFiles method
    templateRenderer.getUsedAsyncFiles = function () {
      return [{
        file: 'app_123.js',
        extension: 'js',
        fileWithoutQuery: 'app_123.js',
        asType: 'script'
      }]
    }

    expect(templateRenderer.renderScripts({})).toBe('<script src="/dist/app_123.js" defer></script>')
  })
})
