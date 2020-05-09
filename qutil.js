'use strict';

/*
    QUtil.js will serve as a file containing all utility
    files for managing the questionnaires that are provided
    by the users
*/

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

// Initialize connection to db
let db;
async function init() {
    const _db = await sqlite.open({
        filename: 'database.sqlite',
        verbose: true,
        driver: sqlite3.Database
    });
    await _db.migrate({ migrationsPath: './sqlite-migrations/' });
    db = _db;
}

module.exports.init = init;