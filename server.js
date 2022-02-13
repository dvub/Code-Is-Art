const express = require('express');
const app = express();
const path = require('path')


app.use('/static', express.static(path.join(__dirname, '/static'))) 
app.use('/js', express.static(path.join(__dirname, '/static/js'))) 
app.use('/styles', express.static(path.join(__dirname, '/static/styles')))


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/static/index.html'));

})

const port = 3000;


app.listen(port)
console.log(`Started listening on port ${port}`)