
const chalk = require('chalk');
var curTime =  new Date().getTime();
var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost/BittrexTradingAppEchange-temp-'+ curTime;
var btcmarkets = [];

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
    ratio: 0.12,
    quantity: 0.015,
    currency: 'BTC',
    buyPremium: 1.001,
    sellTarget: 1.12
}

bittrex.getbalance({ currency : tradeRules.currency }, function( data ) {
        console.log(chalk.yellow('\n', new Date().toUTCString(), 'YOUR CURRENT',tradeRules.currency,"BALANCE IS:"));
        console.log(chalk.yellow(JSON.stringify(data.result), '\n'));
});

bittrex.getmarkets( function( data ) {
  
  data.result.forEach(function(curData) {
      if (curData.MarketName.startsWith(tradeRules.currency)){
        btcmarkets.push(curData.MarketName);
      }
  });

  MongoClient.connect(url, function (err, db) {
  if (err) throw err;
        bittrex.websockets.subscribe(btcmarkets, function(data) {
        if (data.M === 'updateExchangeState') {
            data.A.forEach(function(data_for) {
                if(data_for.Fills.length > 0){
                    var marketsDelta = data_for.Fills[0];
                    console.log(chalk.cyan(new Date().toUTCString(), 'Market Update for: '));
                    console.log(chalk.cyan(new Date().toUTCString() +data_for.MarketName));
                    console.log('TYPE:',marketsDelta.OrderType, 'QT:', marketsDelta.Quantity, '$:', marketsDelta.Rate, 'TS:', marketsDelta.TimeStamp);
                    var col = db.collection(data_for.MarketName);
                    col.insertOne({ marketsDelta }, function (err, res) {
                    if (err) console.log(err);
                    console.log(new Date().toUTCString() + "SAVED TO MONGO");
                    //theAlgorithm(prevSummary[prevSummary.length-2].toObject(), marketsDelta);
                    });
                }
            });
        }
    });        
  });

});


function theAlgorithm(prevCoinsData, currentData){
    var ratio = 0;
        ratio = (currentData.Last - prevCoinsData.Last) / prevCoinsData.Last;
        if(ratio > 0 && currentData.MarketName.startsWith(tradeRules.currency)){
          console.log(chalk.green(new Date().toUTCString(), currentData.MarketName, "RT%:", ratio, "$:", currentData.Ask));
        }

        if(ratio > tradeRules.ratio && ratio != NaN && currentData.MarketName.startsWith(tradeRules.currency)){
            var quantity =  tradeRules.quantity / currentData.Ask;
            console.log(chalk.green(new Date().toUTCString(), 'RULE ACCEPTED / ATTEMPT BUY'));
            console.log(chalk.green(new Date().toUTCString(), currentData.MarketName, "RT%:", ratio, "$:", currentData.Ask));
            if (boughtCurrencies.indexOf(currentData.MarketName) > -1){
                console.log(chalk.red(new Date().toUTCString(), "CURRENCY ALREADY BOUGHT"));
            } else {
                buyLimit(currentData.MarketName, quantity, currentData.Ask * tradeRules.buyPremium);
            }
        }
    }

function buyLimit(market, quantity, rate){
    var url = 'https://bittrex.com/api/v1.1/market/buylimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ quantity + '&rate=' + rate ;
    bittrex.sendCustomRequest( url, function( data ) {
        if (data.success){
            console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL BUY ORDER PLACE ----------------------" ));
            console.log(chalk.green(new Date().toUTCString(), market, "QNT:",quantity,'RT:', rate));
            sellLimit(market, quantity, rate);
            boughtCurrencies.push(market);
        } else {
            console.log(chalk.red(new Date().toUTCString(), "------------------- UNSUCCESSFUL BUY ORDER PLACE  ----------------------" ));
            console.log(chalk.red(new Date().toUTCString(), market, "QNT:",quantity,'RT:', rate));
        }
    });
}

function sellLimit(market, quantity, rate){
    console.log(chalk.yellow(new Date().toUTCString(), 'PLACE SELL'));
    var sellCurrency = market.split("-").pop(1);
    bittrex.getbalance({ currency : sellCurrency }, function( data ) {
        console.log('SELL CURRENCY', sellCurrency);
        console.log(JSON.stringify(data.result));
        if (data.result.Available > 0){
            var sellLimitUrl = 'https://bittrex.com/api/v1.1/market/selllimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ data.result.Available + '&rate=' + rate * tradeRules.sellTarget;
            bittrex.sendCustomRequest( sellLimitUrl, function( data ) {
                if (data.success){
                        console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL SELL ORDER PLACE ----------------------" ));
                        console.log(chalk.green(new Date().toUTCString(), market, "QNT:", quantity,'RT:', rate * tradeRules.sellTarget));
                    } else {
                        console.log(chalk.red(new Date().toUTCString(), "------------------- UNSUCCESSFUL SELL ORDER PLACE ----------------------" ));
                        console.log(chalk.red(new Date().toUTCString(), market, "QNT:", quantity,'RT:', rate * tradeRules.sellTarget));
                    }
                });
        } else {
            setTimeout(function() {
                sellLimit(market, quantity, rate);
            }, 100);
        }
    });
    
}