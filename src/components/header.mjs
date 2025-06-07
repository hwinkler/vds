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

import * as React from 'react'
import {Link} from 'gatsby'
import bikeRacerImage from '../images/bike-racer.png'
const Header = ({siteTitle}) => (
  <header
    style={{
      margin: '0 auto',
      padding: 'var(--space-4) var(--size-gutter)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
    <Link
      to="/"
      style={{
        fontSize: 'var(--font-sm)',
        textDecoration: 'none'
      }}>
      {siteTitle}
    </Link>
    <img
      alt="VDS2 logo"
      height={40}
      style={{margin: 0}}
      src={bikeRacerImage} />
  </header>
)

export default Header
