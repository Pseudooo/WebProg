'use strict';

const express = require('express');
const app = express();

const qutil = require('./qutil.js')

app.get('/questionnaires', asyncWrap(async (req, res) => {
    const content = await qutil.content();
    console.log();
    res.send(JSON.stringify(content));;
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
    await qutil.content();

    console.log('Listening on port 8080!');
})