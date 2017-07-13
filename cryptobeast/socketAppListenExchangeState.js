
const chalk = require('chalk');
var curTime = new Date().getTime();

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://cb-admin:0887pass@ec2-34-203-208-180.compute-1.amazonaws.com:27017/cryptobotDB';

var fs = require('fs');
var util = require('util');
var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

console.log = function(d) { //
  log_file.write(d + '\n');
  log_stdout.write(d + '\n');
};


var btcmarkets = [];
var boughtCurrencies = [];

// BITTREX ACCOUNT CONFIGURATIONS
const bittrex = require('../node.bittrex.api');
const APIKEY = '924376f53659490c9cb5e46b48fcf6bb';
const APISECRET = 'e0f0a8ae97da4c35b1ba0d6f6d4bb2c5';


bittrex.options({
    'apikey': APIKEY,
    'apisecret': APISECRET,
    'stream': false,
    'verbose': true,
    'cleartext': false
});

// ALGORITHM RULES CONFIGURATIONS
var tradeRules = {
    ratio: 0.03,
    quantity: 0.0009,
    currency: 'BTC',
    buyPremium: 1.0005,
    sellTarget: 1.002
}


bittrex.getmarkets(function (data) {

    data.result.forEach(function (curData) {
        if (curData.MarketName.startsWith(tradeRules.currency)) {
            btcmarkets.push(curData.MarketName);
        }
    });

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        bittrex.websockets.subscribe(btcmarkets, function (data) {
            if (data.M === 'updateExchangeState') {
                data.A.forEach(function (data_for) {
                    if (data_for.Fills.length > 0) {
                        console.log(new Date().toUTCString(), 'FILLES ARE FETCHED:', data_for.Fills);
                        data_for.Fills.forEach(function (filllData) {
                            var marketsDelta = filllData;
                            var col = db.collection(data_for.MarketName);
                            col.insertOne({ marketsDelta }, function (err, res) {
                                console.log(new Date().toUTCString(), 'FILLES ARE INSERTED:');
                                if (err) console.log(err);
                                var cursor = col.find().sort( { _id : -1 } ).limit(2);
                                cursor.toArray(function (err, results) {
                                    if (err) console.log(chalk.red( err ));
                                    console.log(chalk.green(new Date().toUTCString(), data_for.MarketName, "RESULT:", res.result.ok));
                                });
                            });
                        });

                    }
                });
            }
        });
    });

});