var mongoose = require('mongoose');
const chalk = require('chalk');
mongoose.connect('mongodb://localhost/AllMarketsState');
// BITTREX ACCOUNT CONFIGURATIONS
const bittrex = require('../node.bittrex.api');
const APIKEY = '924376f53659490c9cb5e46b48fcf6bb';
const APISECRET = 'e0f0a8ae97da4c35b1ba0d6f6d4bb2c5';
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

bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        console.log('Ticker Update for '+ marketsDelta.MarketName, marketsDelta);
      });
    });
  }
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

// bittrex.getcurrencies(function (data) {
//     var currentMarket = 'BTC-' + data.result[0].Currency;

//     for (let i = 0; i < data.result.length; i++) {
//         getIt(currentMarket)
//             .then(result => {
//                 console.log(currentMarket, chalk.cyan(JSON.stringify(ticker)));
//                 currentMarket = 'BTC-' + data.result[i].Currency;

//             })
//             .catch(() => {
//                 currentMarket = 'BTC-' + data.result[i].Currency;
//                 console.log(data.result[i].Currency);
//                 console.log('ERROR');
//             })
//     }

//     function getIt(market) {
//         return new Promise((resolve, reject) => {
//             bittrex.getticker({ market: market }, function (ticker) {
//                 if (ticker.success) {
                    
//                     resolve(ticker);
//                     // console.log(market, chalk.cyan(JSON.stringify(ticker)));
//                 } else {
//                     reject();
//                 }
//             });

//         })
//     }
    // bittrex.getticker({ market: market }, function (ticker) {
    //     if (ticker.success) {
    //         console.log(market, chalk.cyan(JSON.stringify(ticker)));
    //     }
    // });