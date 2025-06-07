import {createRequire} from 'module'
import {createProxyMiddleware} from 'http-proxy-middleware'

const require = createRequire(import.meta.url)

/**
 * @type {import('gatsby').GatsbyNode['onCreateDevServer']}
 */
export const onCreateDevServer = ({app}) => {
  // Proxy API calls to the worker on port 8787 during development
  const apiProxy = createProxyMiddleware({
    target: 'http://localhost:8787',
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log('Proxying request:', req.method, req.url)
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err)
    }
  })

  // Use more specific pattern matching
  app.use((req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.startsWith('/auth/') || req.url === '/health') {
      console.log('Intercepting for proxy:', req.url)
      return apiProxy(req, res, next)
    }
    next()
  })
}

/**
 * @type {import('gatsby').GatsbyNode['createPages']}
 */
export const createPages = async ({actions}) => {
  const {createPage} = actions

  await createPage({
    path: '/using-dsg',
    component: require.resolve('./src/templates/using-dsg.mjs'),
    context: {},
    defer: true
  })
}
