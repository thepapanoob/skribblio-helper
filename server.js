const express = require('express');
const multer = require('multer');
const fs = require('fs');
const https = require('https');
const path = require('path');
const app = express();

// turn on DRUCKBETANKUNG to start the learning process (dont forget to do that for your bots too...)
const DRUCKBETANKUNG = true;
const savePath = path.resolve(__dirname, 'wordlist.json');

const sslOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: 'aaaa'
};

let wordlist = {};
let correctWord = '';

if (fs.existsSync(savePath)) {
  wordlist = JSON.parse(fs.readFileSync(savePath, 'utf8'));
}

app.use(multer().array());

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'https://skribbl.io');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

function insertWord(word) {
  if (wordlist[word.length] === undefined) {
    wordlist[word.length] = [];
  }

  if (wordlist[word.length].indexOf(word) === -1) {
    wordlist[word.length].push(word);
  }
}

app.post('/', (req, res) => {
  if (req.body && req.body.w) insertWord(req.body.w);

  if (req.body.s) correctWord = req.body.w;

  res.send('ok');
});

app.get('/:regex', (req, res) => {
  if (DRUCKBETANKUNG) {
    return res.send([correctWord]);
  }

  const replaceRegex = new RegExp('_', 'g');

  const regexString = req.params.regex.replace(replaceRegex, '[a-z]');
  const filterList =
    wordlist[req.params.regex.length] !== undefined
      ? wordlist[req.params.regex.length]
      : [];
  const filterRegex = new RegExp(regexString, 'g');

  let matchedItems = filterList.filter(value => {
    return value.toLowerCase().match(filterRegex) !== null;
  });

  res.send(matchedItems);
});

app.get('/', (req, res) => {
  res.send('Hello skribbl.io!');
});

let server = https.createServer(sslOptions, app).listen(3000, () => {
  console.log('Skribbl.io Cheat server listening on port 3000!');
});

function gracefulShutdown() {
  console.log('Shutdown');
  fs.writeFile(savePath, JSON.stringify(wordlist, null, 0), function(err) {
    if (err) {
      return console.log(err);
    }

    server.close(() => {
      process.exit();
    });

    setTimeout(() => {
      process.exit();
    }, 10000);
  });
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
