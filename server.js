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

    // TODO: Validate user is logged in
    
    console.log(`File received ~`);
    console.log(`   - From: ${req.user.displayName}`);
    console.log(`   - File: ${req.file.filename}`);
    qutil.register(req.user.id, req.file.filename);
    res.send('Done!');

}

// Is actually serving a static file
// Page then uses URL to request data
async function answerSurvey(req, res) {
    res.sendFile(path.join(__dirname + '/client/respond.html'));
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

// Async wrapper
function asyncWrap(f) {
    return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

app.get('/answer/:id', express.json(), asyncWrap(answerSurvey));
app.get('/api/get/:id', express.json(), asyncWrap(getQuestionnaire))
app.get('/api/recents', asyncWrap(getRecents));

app.post('/api/questionnaires', uploader.single('questionnaire'),
    express.json(), asyncWrap(registerQuestionnaire));

// Start server
app.listen(8080, async () => {

    // Initialize questionnaires module
    await qutil.init();
    console.log('Listening on port 8080!');

});