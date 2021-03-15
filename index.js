//import our packages
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const port = 8080;

//setup express
app.use('/public', express.static(__dirname + '/public'));
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

http.listen(port, () => console.log( `Listening on port ${port} `));



