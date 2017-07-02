var mongoose = require('mongoose');
const chalk = require('chalk');
mongoose.connect('mongodb://localhost/test2');
var ObjectId = require('mongoose').Types.ObjectId;
var prevResult = false;
var MarketSummaries = mongoose.model('MarketSummaries', { 
    timestamp: String,
    coinsData: String
});

// BITTREX ACCOUNT CONFIGURATIONS
const bittrex = require('../node.bittrex.api');
const APIKEY = 'b7075913770c48b1be44b039d7967a7b';
const APISECRET = 'cc4db2baa80c4067bbc2bc089b3ebc07';

bittrex.options({ 
'apikey' : APIKEY,
  'apisecret' : APISECRET,
  'stream' : false, 
  'verbose' : false, 
  'cleartext' : false
}); 

// ALGORITHM RULES CONFIGURATIONS
var tradeRules = {
    ratio: 0.12,
    quantity: 0.0006,
    currency: 'BTC',
    interval: 6000,
    buyPremium: 1,
    sellTarget: 1.40
}

function saveCurrenciesJob(){
    var currentData = {};

    bittrex.getbalance({ currency : tradeRules.currency }, function( data ) {
        console.log(chalk.yellow('\n', new Date().toUTCString(), 'YOUR CURRENT',tradeRules.currency,"BALANCE IS:"));
        console.log(chalk.yellow(JSON.stringify(data.result), '\n'));
        console.log(new Date().toUTCString(), 'FETCH MARKETSUMMARIES');
        bittrex.getmarketsummaries( function( data ) {
            var current = new MarketSummaries({ 
                coinsData: JSON.stringify(data.result),
                timestamp: new Date()
            });
            currentData = data.result;

            current.save(function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log(chalk.cyan(new Date().toUTCString(), 'MARKET SUMMARIES SUCESSFULLY SAVED\n'));
                    if (prevResult){
                        theAlgorithm(prevResult, currentData);
                    }
                    prevResult = result.coinsData;

                }
            });
        });
    });
}

function theAlgorithm(prevCoinsData, currentData){
    var ratio = 0;
    prevCoinsData = JSON.parse(prevCoinsData);
    for (let i = 0; i < prevCoinsData.length; i++){
        if ( Number.isFinite(currentData[i].Last) && Number.isFinite(prevCoinsData[i].Last)) {
            ratio = ((currentData[i].Last.toPrecision(5) - prevCoinsData[i].Last.toPrecision(5)) / prevCoinsData[i].Last.toPrecision(5)).toPrecision(5);
        }

        if (ratio > 0) {
            console.log(chalk.magenta(new Date().toUTCString(), currentData[i].MarketName, ratio));
        }

        if(ratio > tradeRules.ratio && ratio != NaN && currentData[i].MarketName.startsWith(tradeRules.currency)){
            var quantity =  tradeRules.quantity / currentData[i].Ask;
            console.log(chalk.green(new Date().toUTCString(), 'RULE ACCEPTED / ATTEMPT BUY'));
            console.log(chalk.magenta(new Date().toUTCString(), currentData[i].MarketName, ratio, currentData[i].Ask));
            buyLimit(currentData[i].MarketName, quantity, currentData[i].Ask * tradeRules.buyPremium);
        }
    }

}

function buyLimit(market, quantity, rate){
    var url = 'https://bittrex.com/api/v1.1/market/buylimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ quantity + '&rate=' + rate ;
    bittrex.sendCustomRequest( url, function( data ) {
        if (data.success){
            console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL BUY ----------------------" ));
            console.log(chalk.green(new Date().toUTCString(), market, quantity, data.message, rate));
            console.log(chalk.yellow(new Date().toUTCString(), 'PLACE SELL'));
            sellLimit(market, quantity, rate);
        } else {
            console.log(chalk.red(new Date().toUTCString(), "------------------- UNSUCCESSFUL BUY ----------------------" ));
            console.log(chalk.red(new Date().toUTCString(), market, quantity, data.message, rate));
        }
    });
}

function sellLimit(market, quantity, rate){
    var sellCurrency = market.split("-").pop(1);
    bittrex.getbalance({ currency : sellCurrency }, function( data ) {
        console.log('SELL CURRENCY', sellCurrency);
        console.log(JSON.stringify(data.result));
        if (data.result.Available > 0){
            var sellLimitUrl = 'https://bittrex.com/api/v1.1/market/selllimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ data.result.Available + '&rate=' + rate * tradeRules.sellTarget;
            bittrex.sendCustomRequest( sellLimitUrl, function( data ) {
                if (data.success){
                        console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL SELL ----------------------" ));
                        console.log(chalk.green(new Date().toUTCString(), market, quantity, data.message, rate * tradeRules.sellTarget));
                    } else {
                        console.log(chalk.red(new Date().toUTCString(), "------------------- UNSUCCESSFUL SELL ----------------------" ));
                        console.log(chalk.red(new Date().toUTCString(), market, quantity, data.message, rate * tradeRules.sellTarget));
                    }
                });
        } else {
            setTimeout(function() {
                sellLimit(market, quantity, rate);
            }, 100);
        }
    });
    
}

setInterval(saveCurrenciesJob, tradeRules.interval);

// function getPrevData(id){
//     MarketSummaries.findById(new ObjectId(id), function (err, coinsData) {
//         if (err) return handleError(err);
//         return coinsData;
//     })
// }


// var url2 = 'https://bittrex.com/api/v1.1/market/getopenorders?apikey=' + APIKEY + '&market=' + market

// bittrex.sendCustomRequest( url2, function( data ) {
//     console.log(data);