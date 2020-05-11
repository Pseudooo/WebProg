'use strict';

const express = require('express');
const qutil = require('./qutil.js')
const multer = require('multer');
const GoogleAuth = require('simple-google-openid');

const app = express();
const uploader = multer({ dest: 'surveys' })

app.use(express.static('client', { extensions: ['html'] }))

/**
    Will serve to register all uploaded JSON questionnaires
    under the user that's uploaded them
*/
async function registerQuestionnaire(req, res) {

    const fname = req.file.filename;
    console.log(`File received: ${fname}`);
    res.send('Done!');

}

// Async wrapper
function asyncWrap(f) {
    return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

app.post('/questionnaires', uploader.single('questionnaire'),
    express.json(), asyncWrap(registerQuestionnaire));

// Start server
app.listen(8080, async () => {

    // Initialize questionnaires module
    await qutil.init();
    console.log('Listening on port 8080!');

});