const chalk = require('chalk');
var curTime = new Date().getTime();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/BittrexTradingAppEchange-temp-' + curTime;

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




    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        bittrex.websockets.subscribe(['BTC-AEON'], function (data) {
            if (data.M === 'updateExchangeState') {
                data.A.forEach(function (data_for) {
                    console.log(chalk.cyan(new Date().toUTCString()));
                    console.log(chalk.cyan(JSON.stringify(data_for)));
                });
            }
        });
    });
