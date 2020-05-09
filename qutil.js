'use strict';

/*
    QUtil.js will serve as a file containing all utility
    files for managing the questionnaires that are provided
    by the users
*/

const sqlite = require('sqlite');

async function init() {
    db = await sqlite.open({ filename: 'database.sqlite', verbose: true });
    return db;
}

// Initialize connection to db
let db;
Promise.resolve(init()).then((x) => {
    db = x;
}, (e) => {
    console.log('Failed to establish connection with db!');
    console.log(e);
})

