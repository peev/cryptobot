
const chalk = require('chalk');
var curTime = new Date().getTime();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/BittrexTradingAppEchange-temp-' + curTime;
var btcmarkets = [];
var boughtCurrencies = [];
var request = require('request');
JSONStream = require('JSONStream');

// var info = request('https://yobit.net/api/3/info', function (error, response, body) {
//   console.log('error:', error); // Print the error if one occurred 
//   console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
//   console.log('body:', body); // Print the HTML for the Google homepage. 
// });





// console.log(getTicker);

request('https://yobit.net/api/3/ticker/ltc_btc')
          .pipe(JSONStream.parse('*'))
          .pipe(es.mapSync(function(data) {
            callback(data);
            ((opts.verbose) ? console.log("streamed from " + op.uri + " in: %ds", (Date.now() - start) / 1000) : '');
          }));

// // BITTREX ACCOUNT CONFIGURATIONS
// const bittrex = require('../node.bittrex.api');
// const APIKEY = '924376f53659490c9cb5e46b48fcf6bb';
// const APISECRET = 'e0f0a8ae97da4c35b1ba0d6f6d4bb2c5';


// bittrex.options({
//     'apikey': APIKEY,
//     'apisecret': APISECRET,
//     'stream': false,
//     'verbose': true,
//     'cleartext': false
// });

// // ALGORITHM RULES CONFIGURATIONS
// var tradeRules = {
//     ratio: 0.03,
//     quantity: 0.0009,
//     currency: 'BTC',
//     buyPremium: 1.0005,
//     sellTarget: 1.002
// }

// bittrex.getbalance({ currency: tradeRules.currency }, function (data) {
//     console.log(chalk.yellow('\n', new Date().toUTCString(), 'YOUR CURRENT', tradeRules.currency, "BALANCE IS:"));
//     console.log(chalk.yellow(JSON.stringify(data.result), '\n'));
// });

// bittrex.getmarkets((data) => {

//     data.result.forEach(function (curData) {
//         if (curData.MarketName.startsWith(tradeRules.currency)) {
//             btcmarkets.push(curData.MarketName);
//         }
//     });

//     MongoClient.connect(url, function (err, db) {
//         if (err) throw err;
//         bittrex.websockets.subscribe(btcmarkets, function (data) {
//             if (data.M === 'updateExchangeState') {
//                 data.A.forEach(function (data_for) {
//                     if (data_for.Fills.length > 0) {
//                         var marketsDelta = data_for.Fills[0];
//                         var col = db.collection(data_for.MarketName);
//                         col.insertOne({ marketsDelta }, function (err, res) {
//                             if (err) console.log(err);
                  
//                             var cursor = col.find().sort( { _id : -1 } ).limit(2);
//                             cursor.toArray(function (err, results) {
//                                 if (err) throw err;
//                                 if(results.length > 1){
//                                     theAlgorithm(results[1].marketsDelta, results[0].marketsDelta, data_for.MarketName)
//                                 }
//                             });
//                         });
//                     }
//                 });
//             }
//         });
//     });

// });


// function theAlgorithm(prevCoinsData, currentData, marketName) {
//     var ratio = 0;
//     ratio = (currentData.Rate - prevCoinsData.Rate) / prevCoinsData.Rate;
//     if (ratio > 0 && marketName.startsWith(tradeRules.currency)) {
//         console.log(chalk.cyan(new Date().toUTCString(), marketName, "RT%:", ratio, "$:", currentData.Rate));
//     }

//     if (ratio > tradeRules.ratio && ratio != NaN && marketName.startsWith(tradeRules.currency)) {
//         var quantity = tradeRules.quantity / currentData.Rate;
//         console.log(chalk.green(new Date().toUTCString(), 'RULE ACCEPTED / ATTEMPT BUY'));
//         console.log(chalk.green(new Date().toUTCString(), marketName, "RT%:", ratio, "$:", currentData.Rate));
//         if (boughtCurrencies.indexOf(marketName) > -1) {
//             console.log(chalk.red(new Date().toUTCString(), "CURRENCY ALREADY BOUGHT"));
//         } else {
//             buyLimit(marketName, quantity, currentData.Rate * tradeRules.buyPremium);
//         }
//     }
// }

// function buyLimit(market, quantity, rate) {
//     var url = 'https://bittrex.com/api/v1.1/market/buylimit?apikey=' + APIKEY + '&market=' + market + '&quantity=' + quantity + '&rate=' + rate;
//     bittrex.sendCustomRequest(url, function (data) {
//         if (data.success) {
//             console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL BUY ORDER PLACE ----------------------"));
//             console.log(chalk.green(new Date().toUTCString(), market, "QNT:", quantity, 'RT:', rate));
//             sellLimit(market, quantity, rate);
//             boughtCurrencies.push(market);
//         } else {
//             console.log(chalk.red(new Date().toUTCString(), "------------------- UNSUCCESSFUL BUY ORDER PLACE  ----------------------"));
//             console.log(chalk.red(new Date().toUTCString(), market, "QNT:", quantity, 'RT:', rate));
//         }
//     });
// }

// function sellLimit(market, quantity, rate) {
//     console.log(chalk.yellow(new Date().toUTCString(), 'PLACE SELL'));
//     var sellCurrency = market.split("-").pop(1);
//     bittrex.getbalance({ currency: sellCurrency }, function (data) {
//         console.log('SELL CURRENCY', sellCurrency);
//         console.log(JSON.stringify(data.result));
//         if (data.result.Available > 0) {
//             var sellLimitUrl = 'https://bittrex.com/api/v1.1/market/selllimit?apikey=' + APIKEY + '&market=' + market + '&quantity=' + data.result.Available + '&rate=' + rate * tradeRules.sellTarget;
//             bittrex.sendCustomRequest(sellLimitUrl, function (data) {
//                 if (data.success) {
//                     console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL SELL ORDER PLACE ----------------------"));
//                     console.log(chalk.green(new Date().toUTCString(), market, "QNT:", quantity, 'RT:', rate * tradeRules.sellTarget));
//                 } else {
//                     console.log(chalk.red(new Date().toUTCString(), "------------------- UNSUCCESSFUL SELL ORDER PLACE ----------------------"));
//                     console.log(chalk.red(new Date().toUTCString(), market, "QNT:", quantity, 'RT:', rate * tradeRules.sellTarget));
//                 }
//             });
//         } else {
//             setTimeout(function () {
//                 sellLimit(market, quantity, rate);
//             }, 100);
//         }
//     });

// }