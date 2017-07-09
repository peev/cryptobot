const chalk = require('chalk');

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://cb-admin:0887pass@ec2-34-203-208-180.compute-1.amazonaws.com:27017/cryptobotDBBB';

// LOG OUTPUT
var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' });
var log_stdout = process.stdout;

console.log = function (d) { //
  log_file.write(d + '\n');
  log_stdout.write(d + '\n');
};

// mongoose.connect('mongodb://localhost/BittrexMarketsState3');
// BITTREX ACCOUNT CONFIGURATIONS
const bittrex = require('../node.bittrex.api');
const APIKEY = '924376f53659490c9cb5e46b48fcf6bb';
const APISECRET = 'e0f0a8ae97da4c35b1ba0d6f6d4bb2c5';

bittrex.options({
  'apikey': APIKEY,
  'apisecret': APISECRET,
  'stream': false,
  'verbose': false,
  'cleartext': false
});

MongoClient.connect(url, function (err, db) {
  if (err) throw err;

  bittrex.websockets.listen(function (data) {
    if (data.M === 'updateSummaryState') {
      data.A.forEach(function (data_for) {
        data_for.Deltas.forEach(function (marketsDelta) {
          var col = db.collection(marketsDelta.MarketName);
          col.insertOne({ marketsDelta }, function (err, res) {
            if (err) console.log(err);
            console.log(new Date().toUTCString() + " " + marketsDelta.MarketName + " " + marketsDelta.Last + " " +'SAVED TO MONGO');
            // Finish up test
          });
        });
      });
    }
  });
});