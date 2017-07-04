var mongoose = require('mongoose');
const chalk = require('chalk');
// BITTREX ACCOUNT CONFIGURATIONS
const bittrex = require('../node.bittrex.api');
const APIKEY = 'b7075913770c48b1be44b039d7967a7b';
const APISECRET = 'cc4db2baa80c4067bbc2bc089b3ebc07';
var MarketSummaries = mongoose.model('MarketSummaries', {
    timestamp: String,
    coinsData: String
});

bittrex.options({
    'apikey': APIKEY,
    'apisecret': APISECRET,
    'stream': false,
    'verbose': false,
    'cleartext': false
});

// bittrex.getmarketsummaries( function( data ) {
//     var current = new MarketSummaries({ 
//         coinsData: JSON.stringify(data.result),
//         timestamp: new Date()
//     });

//     for (let i = 0; i < data.result.length; i++){
//         console.log(chalk.magenta(new Date().toUTCString(), JSON.stringify(data.result[i])));
//     }
// });

// bittrex.getticker( { market : "BTC-SLS" }, function( ticker ) {
//         console.log( ticker );
//     });

bittrex.getcurrencies(function (data) {
    var currentMarket = 'BTC-' + data.result[0].Currency;

    for (let i = 0; i < data.result.length; i++) {
        getIt(currentMarket)
            .then(result => {
                console.log(currentMarket, chalk.cyan(JSON.stringify(ticker)));
                currentMarket = 'BTC-' + data.result[i].Currency;

            })
            .catch(() => {
                currentMarket = 'BTC-' + data.result[i].Currency;
                console.log('data.result[i].Currency');
                console.log('ERROR');
            })
    }

    function getIt(market) {
        return new Promise((resolve, reject) => {
            bittrex.getticker({ market: market }, function (ticker) {
                if (ticker.success) {
                    
                    resolve(ticker);
                    // console.log(market, chalk.cyan(JSON.stringify(ticker)));
                } else {
                    reject();
                }
            });

        })
    }
    // bittrex.getticker({ market: market }, function (ticker) {
    //     if (ticker.success) {
    //         console.log(market, chalk.cyan(JSON.stringify(ticker)));
    //     }
    // });
});