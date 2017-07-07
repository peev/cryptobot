var mongoose = require('mongoose');
const chalk = require('chalk');

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
mongoose.connect('mongodb://cb-admin:0887pass@ec2-34-203-208-180.compute-1.amazonaws.com:27017/cryptobotDB', {
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectTimeoutMS: 0
    }
  }
});
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open.');
});
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});
// When the connection is disconnected
mongoose.connection.on('disconnected', function (err) {
  console.log('Mongoose default connection disconnected: ' + err);
});

var Schema = mongoose.Schema;
// BITTREX ACCOUNT CONFIGURATIONS
const bittrex = require('../node.bittrex.api');
const APIKEY = '924376f53659490c9cb5e46b48fcf6bb';
const APISECRET = 'e0f0a8ae97da4c35b1ba0d6f6d4bb2c5';
var SummaryState = new Schema({
  MarketName: String,
  High: Number,
  Low: Number,
  Volume: Number,
  Last: Number,
  BaseVolume: Number,
  TimeStamp: Date,
  Bid: Number,
  Ask: Number,
  OpenBuyOrders: Number,
  OpenSellOrders: Number,
  PrevDay: Number,
  Created: Date
});


bittrex.options({
  'apikey': APIKEY,
  'apisecret': APISECRET,
  'stream': false,
  'verbose': false,
  'cleartext': false
});

bittrex.websockets.listen(function (data) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function (data_for) {
      data_for.Deltas.forEach(function (marketsDelta) {
        console.log('Ticker Update for ' + marketsDelta.MarketName, marketsDelta);

        var currencyState = mongoose.model(marketsDelta.MarketName, SummaryState)

        var current = new currencyState({
          MarketName: marketsDelta.MarketName,
          High: marketsDelta.High,
          Low: marketsDelta.Low,
          Volume: marketsDelta.Volume,
          Last: marketsDelta.Last,
          BaseVolume: marketsDelta.BaseVolume,
          TimeStamp: marketsDelta.TimeStamp,
          Bid: marketsDelta.Bid,
          Ask: marketsDelta.Ask,
          OpenBuyOrders: marketsDelta.OpenBuyOrders,
          OpenSellOrders: marketsDelta.OpenSellOrders,
          PrevDay: marketsDelta.PrevDay,
          Created: marketsDelta.Created
        });


        current.save(function (err, result) {
          if (err) {
            console.log(err);
          } else {
            console.log(chalk.cyan(new Date().toUTCString(), 'SUMMARY STATE SUCESSFULLY SAVED\n'));
            console.log(result.MarketName);
          }
        });
      });
    });
  }
});