
const express = require('express');
const app = express();

const dbutil = require('./qutil.js')

// Start server
app.listen(8080, () => {
    console.log('Listening on port 8080!');
})