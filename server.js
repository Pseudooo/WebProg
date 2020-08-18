'use strict';

const express = require('express');
const qutil = require('./qutil.js')
const multer = require('multer');
const GoogleAuth = require('simple-google-openid');
const path = require('path');

const app = express();
const uploader = multer({ dest: 'questionnaires' });

app.use(GoogleAuth("125277199265-qqbdra5bp7gt38cnaeqp7rqek9gaqefq.apps.googleusercontent.com"));
app.use(express.static('client', { extensions: ['html'] }));

/**
    Will serve to register all uploaded JSON questionnaires
    under the user that's uploaded them
*/
async function registerQuestionnaire(req, res) {

    if(req.user === undefined) // User not logged in
        res.status(401).send('Please log in!');
    
    // Indicate uploaded survey
    console.log(`File received ~`);
    console.log(`   - From: ${req.user.displayName}`);
    console.log(`   - File: ${req.file.filename}`);
    qutil.register(req.user.id, req.file.filename);
    res.send('Done!');

}

// Is actually serving a static file
// Page then uses URL to request data
async function openQuestionnaire(req, res) {
    res.sendFile(path.join(__dirname + '/client/respond.html'));
}

async function giveResponse(req, res) {
    const id = req.params.id;

    await qutil.giveResponse(id, req.body, req.user === undefined ? null : req.user.id);

    res.send('Done!');
}

async function getRecents(req, res) {
    const response = await qutil.recent();
    res.json(response);
}

async function getQuestionnaire(req, res) {

    const questionnaire = await qutil.getQuestionnaire(req.params.id);
    if(questionnaire === undefined){
        res.status(404).send('Questionnaire not found');
    }else {
        res.json(questionnaire);
    }

}

async function getUserQuestionnaires(req, res) {

    if(req.user === undefined) {
        res.status(401).send('Please log in!');
        return; // idk if return is needed
    }

    console.log(`Fetching Questionnaires for ${req.user.displayName}`)

    const questionnaire = await qutil.getUserQuestionnaires(req.user.id);
    res.json(questionnaire);

}

async function getOwner(req, res) {
    const payload = await qutil.getQuestionnaireOwner(req.params.id);
    res.json(payload);
}

async function downloadResponses(req, res) {

    if(req.user === undefined) {
        res.status(401).send('Please log in!');
        return;
    }

    const owner = await qutil.getQuestionnaireOwner(req.params.id);

    console.log(`Owner: ${owner.owner}`);
    console.log(`Requestee: ${req.user.id}`)

    if(owner.owner !== req.user.id) {
        console.log("Disallowed");
        res.status(401).send("You can't do that!");
        return;
    }

    const payload = JSON.stringify(await qutil.getResponses(req.params.id));
    res.send(payload);

}

// Async wrapper
function asyncWrap(f) {
    return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

app.get('/answer/:id', express.json(), asyncWrap(openQuestionnaire));
app.post('/answer/:id', express.json(), asyncWrap(giveResponse))

app.get('/api/get/:id', express.json(), asyncWrap(getQuestionnaire))
app.get('/api/owner/:id', express.json(), asyncWrap(getOwner));
app.get('/api/recents', asyncWrap(getRecents));
app.get('/api/questionnaires', express.json(), asyncWrap(getUserQuestionnaires));

app.get('/api/responses/:id', express.json(), asyncWrap(downloadResponses));

app.post('/api/questionnaires', uploader.single('questionnaire'),
    express.json(), asyncWrap(registerQuestionnaire));

// Start server
app.listen(8080, async () => {

    // Initialize questionnaires module
    await qutil.init();
    console.log('Listening on port 8080!');

});