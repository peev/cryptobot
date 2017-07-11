
const chalk = require('chalk');
var curTime = new Date().getTime();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/MarketHistory_Fills'
;
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

bittrex.getbalance({ currency: tradeRules.currency }, function (data) {
    console.log(chalk.yellow('\n', new Date().toUTCString(), 'YOUR CURRENT', tradeRules.currency, "BALANCE IS:"));
    console.log(chalk.yellow(JSON.stringify(data.result), '\n'));
});

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
                        var marketsDelta = data_for.Fills[0];
                        var col = db.collection(data_for.MarketName);
                        col.insertOne({ marketsDelta }, function (err, res) {
                            if (err) console.log(err);
                        });
                    }
                });
            }
        });
    });

});