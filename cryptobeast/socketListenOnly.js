var mongoose = require('mongoose');
const chalk = require('chalk');
mongoose.connect('mongodb://localhost/BittrexMarketsState3');
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

bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        console.log('Ticker Update for '+ marketsDelta.MarketName, marketsDelta);

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
                console.log(chalk.cyan(new Date().toUTCString(), 'SUMMARY STATE SUCESSFULLY SAVED\n'));
                console.log(result.MarketName);
            }
        });
      });
    });
  }
});