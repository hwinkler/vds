/*
 * Copyright (C) 2025 Hugh Winkler
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * Layout component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from 'react'
import {useStaticQuery, graphql} from 'gatsby'

import Header from './header'
import './layout.css'

const Layout = ({children}) => {
  const data = useStaticQuery(graphql`
    query SiteTitleQuery {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <>
      <Header siteTitle={data.site.siteMetadata?.title || 'Title'} />
      <div
        style={{
          margin: '0 auto',
          maxWidth: 'var(--size-content)'
          // padding: 'var(--size-gutter)'
        }}>
        <main>{children}</main>
        <footer
          style={{
            marginTop: 'var(--space-5)',
            fontSize: 'var(--font-sm)'
          }}>
          © {new Date().getFullYear()} hugh winkler &middot; 
          {' '}
          <a href="https://github.com/hwinkler/vds">use the source luke</a>
        </footer>
      </div>
    </>
  )
}

export default Layout
