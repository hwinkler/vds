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

