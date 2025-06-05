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

import sqlite3 from 'sqlite3'
import path from 'path'
import {fileURLToPath} from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const dbPath = path.join(dirname, '../../database/vds.db')

export class Database {
  constructor() {
    this.db = null
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, err => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close(err => {
          if (err) {
            reject(err)
          } else {
            resolve()
          }
        })
      } else {
        resolve()
      }
    })
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err)
        } else {
          // sqlite3 provides `this` context in callbacks
          // eslint-disable-next-line no-invalid-this
          resolve({id: this.lastID, changes: this.changes})
        }
      })
    })
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  }
}

