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


var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test2');
var schedule = require('node-schedule');
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
var ObjectId = require('mongoose').Types.ObjectId; 

var MarketSummaries = mongoose.model('MarketSummaries', { 
    timestamp: String,
    coinsData: String
});

var prevResult = false;

function saveCurrenciesJob(){


    bittrex.getbalance({ currency : 'BTC' }, function( data ) {
        console.log( data );
    });


    var currentData = {};
    console.log(new Date() + 'Job started');
    bittrex.getmarketsummaries( function( data ) {
            currentData = data.result;
            var current = new MarketSummaries({ 
                coinsData: JSON.stringify(data.result),
                timestamp: new Date()
            });
            current.save(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(new Date() + 'Successfuly saved.');
                if (prevResult){
                    theAlgorithm(prevResult, currentData);
                }
                prevResult = result.coinsData;

            }
        });
    });
    console.log(new Date() + 'Job done');

}

function theAlgorithm(prevCoinsData, currentData){
    console.log('Start trading');
    prevCoinsData = JSON.parse(prevCoinsData);
    for (let i = 0; i < prevCoinsData.length; i++){
        var ratio =  (currentData[i].Last - prevCoinsData[i].Last) / prevCoinsData[i].Last;
        if(ratio > 0.08 && ratio != NaN && currentData[i].MarketName.startsWith('BTC')){
            var quantity =  0.0005 / currentData[i].Ask;
            console.log(currentData[i].MarketName, ratio, currentData[i].Ask);
            buyLimit(currentData[i].MarketName, quantity, currentData[i].Last * 1.02);
        }
    }

}

function buyLimit(market, quantity, rate){
    var url = 'https://bittrex.com/api/v1.1/market/buylimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ quantity + '&rate=' + rate ;
    bittrex.sendCustomRequest( url, function( data ) {
    console.log( "-------------------Transaction successful----------------------" );
    console.log(data);
    });
}

function sellLimit(market, quantity, rate){
    var url = 'https://bittrex.com/api/v1.1/market/selllimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ quantity + '&rate=' + rate;
    bittrex.sendCustomRequest( url, function( data ) {
    console.log( data );
    });
}

setInterval(saveCurrenciesJob, 10000);

// function getPrevData(id){
//     MarketSummaries.findById(new ObjectId(id), function (err, coinsData) {
//         if (err) return handleError(err);
//         return coinsData;
//     })
// }
