'use strict';

const express = require('express');
const app = express();

const qutil = require('./qutil.js')
const multer = require('multer');
const uploader = multer({ dest: 'surveys' })

app.use(express.static('client', { extensions: ['html'] }))

app.get('/questionnairess', asyncWrap(async (req, res) => {
    const content = await qutil.content();
    console.log();
    res.send(JSON.stringify(content));;
}));

app.post('/questionnaires', uploader.single('questionnaire'), express.json(), asyncWrap(async (req, res) => {
    console.log('gottem');
    res.send("Done");
}));

function asyncWrap(f) {
    return (req, res, next) => {
    Promise.resolve(f(req, res, next))
      .catch((e) => next(e || new Error()));
  };
}

// Start server
app.listen(8080, async () => {

    await qutil.init();

    console.log('Listening on port 8080!');
})