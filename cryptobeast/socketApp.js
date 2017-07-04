var mongoose = require('mongoose');
const chalk = require('chalk');
mongoose.connect('mongodb://localhost/BittrexMarketsState');
var Schema = mongoose.Schema;

// BITTREX ACCOUNT CONFIGURATIONS
const bittrex = require('../node.bittrex.api');
const APIKEY = '924376f53659490c9cb5e46b48fcf6bb';
const APISECRET = 'e0f0a8ae97da4c35b1ba0d6f6d4bb2c5';
var SummaryState = new Schema ({ 
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

// ALGORITHM RULES CONFIGURATIONS
var tradeRules = {
    ratio: 0.03,
    quantity: 0.0001,
    currency: 'BTC',
    interval: 2000,
    buyPremium: 1,
    sellTarget: 1.40
}


bittrex.getbalance({ currency : tradeRules.currency }, function( data ) {
        console.log(chalk.yellow('\n', new Date().toUTCString(), 'YOUR CURRENT',tradeRules.currency,"BALANCE IS:"));
        console.log(chalk.yellow(JSON.stringify(data.result), '\n'));
});

bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
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

                var summary = mongoose.model(marketsDelta.MarketName, SummaryState);
                summary.find({}).sort({date: -1}).find(function(err, prevSummary){
                if (err) return handleError(err);
                  if(prevSummary.length > 2){
                    theAlgorithm(prevSummary[prevSummary.length-2].toObject(), marketsDelta);
                  }
                })

                //theAlgorithm(prevCoinsData, result);
            }
        });
      });
    });
  }
});

function theAlgorithm(prevCoinsData, currentData){
    var ratio = 0;
        ratio = (currentData.Last - prevCoinsData.Last) / prevCoinsData.Last;
        if(ratio > 0 && currentData.MarketName.startsWith(tradeRules.currency)){
          console.log(chalk.green(new Date().toUTCString(), currentData.MarketName, "RT%:", ratio, "$:", currentData.Ask));
        }

        if(ratio > tradeRules.ratio && ratio != NaN && currentData.MarketName.startsWith(tradeRules.currency)){
            var quantity =  tradeRules.quantity / currentData.Ask;
            //console.log(chalk.green(new Date().toUTCString(), 'RULE ACCEPTED / ATTEMPT BUY'));
            //console.log(chalk.green(new Date().toUTCString(), currentData.MarketName, "RT%:", ratio, "$:", currentData.Ask));
            //buyLimit(currentData.MarketName, quantity, currentData.Ask * tradeRules.buyPremium);
        }
    }

function buyLimit(market, quantity, rate){
    var url = 'https://bittrex.com/api/v1.1/market/buylimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ quantity + '&rate=' + rate ;
    bittrex.sendCustomRequest( url, function( data ) {
        if (data.success){
            console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL BUY ORDER PLACE ----------------------" ));
            console.log(chalk.green(new Date().toUTCString(), market, "QNT:",quantity,'RT:', rate));
            sellLimit(market, quantity, rate);
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