'use strict';

/*
    QUtil.js will serve to handle everything relevant to the
    questionnaires that are going to be handled by the server
*/

const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFile = util.promisify(fs.readFile);

// Initialize database
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

/**
    Function to register a questionnaire with the server.
    Will store file's name as UUID in the database and create
    a table to store responses of the given questionnaire
*/
async function register(user, filename) {
    
    const content = JSON.parse(await readFile(`./questionnaires/${filename}`));

    // TODO: Validate JSON as db is modified

    // Construct a questionnaire record
    const qrecord = [filename, user, new Date(), content.name];
    
    // Prepare a string to make appropriate table (Validation should go here too)
    const fields = [`id TEXT PRIMARY KEY`, `user TEXT`];
    for(const x of content.questions)
        fields.push(`${x.id} ${x.type === 'number' ? 'INTEGER' : 'TEXT'}`);

    // Make required modifications to db
    await db.run(`INSERT INTO Questionnaires VALUES (?, ?, ?, ?)`, qrecord);
    await db.run(`CREATE TABLE res_${filename} ( ${fields.join(', ')} )`);

}

/**
    Function to get a questionnaire given its ID
*/
async function getQuestionnaire(questionnaires) {
    let data;
    if(fs.existsSync(`./questionnaires/${questionnaires}`))
        data = JSON.parse(await readFile(`./questionnaires/${questionnaires}`));
    return data;
}

/**
    Get the most recent questionnaires that have been submitted
*/
async function recent() {
    return await db.all(`SELECT * FROM Questionnaires ORDER BY created DESC LIMIT 25`);
}

module.exports.init = init;
module.exports.register = register;
module.exports.recent = recent;
module.exports.getQuestionnaire = getQuestionnaire