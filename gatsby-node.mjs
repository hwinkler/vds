import {createRequire} from 'module'
const require = createRequire(import.meta.url)

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
