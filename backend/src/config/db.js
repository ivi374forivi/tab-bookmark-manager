const { pool } = require('./database');

const db = {
  query: (text, params) => {
    if (process.env.NODE_ENV === 'test') {
      return new Promise((resolve, reject) => {
        pool.all(text.replace(/\$(\d+)/g, '?'), params, (err, rows) => {
          if (err) {
            return reject(err);
          }
          resolve({ rows });
        });
      });
    }
    return pool.query(text, params);
  },
  run: (text, params) => {
    if (process.env.NODE_ENV === 'test') {
      return new Promise((resolve, reject) => {
        pool.run(text.replace(/\$(\d+)/g, '?'), params, function (err) {
          if (err) {
            return reject(err);
          }
          resolve({ rowCount: this.changes, lastID: this.lastID });
        });
      });
    }
    return pool.query(text, params);
  },
  get: (text, params) => {
    if (process.env.NODE_ENV === 'test') {
      return new Promise((resolve, reject) => {
        pool.get(text.replace(/\$(\d+)/g, '?'), params, (err, row) => {
          if (err) {
            return reject(err);
          }
          resolve(row);
        });
      });
    }
    return pool.query(text, params).then(res => res.rows[0]);
  }
};

module.exports = db;
