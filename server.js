'use strict';

var express       = require('express'),
    mongo         = require('mongodb'),
    mongoose      = require('mongoose'),
    bodyParser    = require('body-parser'),
    urlProcessor  = require('./controller/urlProcessor.js');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());
app.use(bodyParser.urlencoded({'extended': false}));

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", urlProcessor.addUrl);

app.get("/api/shorturl/:shortUrl", urlProcessor.processShortUrl);

app.listen(port, function () {
  console.log('Node.js listening ...');
});