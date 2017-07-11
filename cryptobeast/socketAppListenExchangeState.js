
const chalk = require('chalk');
var curTime = new Date().getTime();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://cb-admin:0887pass@ec2-34-203-208-180.compute-1.amazonaws.com:27017/MarketHistory_Fills'
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