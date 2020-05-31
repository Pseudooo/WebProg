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
const {v4: uuid} = require('uuid');
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
    await db.run(`CREATE TABLE res_${filename} ( ${fields.join(',')} )`);

}

/**
    Function to get a questionnaire given its ID
*/
async function getQuestionnaire(questionnaire) {
    let data;
    if(fs.existsSync(`./questionnaires/${questionnaire}`))
        data = JSON.parse(await readFile(`./questionnaires/${questionnaire}`));
    data.id = questionnaire;

    return data;
}

async function getUserQuestionnaires(userID) {
    const questionnaires = await db.all(`SELECT id FROM Questionnaires WHERE owner = ? ORDER BY created`, [userID]);

    let toReturn = [];
    for(const q of questionnaires)
        toReturn.push(await getQuestionnaire(q.id));

    return toReturn;

}

async function getQuestionnaireOwner(questionnaireID) {
    const owner = await db.get('SELECT owner FROM Questionnaires WHERE id = ?', questionnaireID);
    return owner;
}

/**
    Get the most recent questionnaires that have been submitted
*/
async function recent() {
    return await db.all(`SELECT * FROM Questionnaires ORDER BY created DESC LIMIT 25`);
}

async function giveResponse(id, response, user) {

    // Get a copy of the questionnaire
    // This copy is needed to order the questions
    const questionnaire = await getQuestionnaire(id);

    // Construct list of responses
    // TODO Validation
    const vals = [uuid(), user]; // init with the res id and user (null)
    for(const key of questionnaire['questions'])
        vals.push(response[key.id]);

    //                                          This disgusting bit makes n ? values
    await db.run(`INSERT INTO res_${id} VALUES (${Array(vals.length).fill('?').join(', ')})`, vals);

}

async function getResponses(id) {
    const data = await db.all(`SELECT * FROM res_${id}`);
    return data;
}   

module.exports.init = init;
module.exports.register = register;
module.exports.recent = recent;
module.exports.getQuestionnaire = getQuestionnaire;
module.exports.giveResponse = giveResponse;
module.exports.getUserQuestionnaires = getUserQuestionnaires;
module.exports.getQuestionnaireOwner = getQuestionnaireOwner;
module.exports.getResponses = getResponses;