const chalk = require('chalk');
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

function sellAllCurrencies(){
    bittrex.getbalances( function( data ) {
        data.result.forEach(function(balance) {
            var market = 'BTC-';
            market = market.concat(balance.Currency);

            if (balance.Available > 0 && market!='BTC-BTC' ){
                bittrex.getticker( { market : market }, function( data ) {
                    sellLimit(market, balance.Available, data.result.Bid)
                }); 
            }
        });
    });
}

function sellLimit(market, quantity, rate){
            var sellLimitUrl = 'https://bittrex.com/api/v1.1/market/selllimit?apikey=' + APIKEY + '&market=' + market + '&quantity='+ quantity + '&rate=' + rate;
            bittrex.sendCustomRequest( sellLimitUrl, function( data ) {
                if (data.success){
                        console.log(chalk.green(new Date().toUTCString(), "------------------- SUCCESSFUL SELL ----------------------" ));
                        console.log(chalk.green(new Date().toUTCString(), market, quantity, data.message));
                    } else {
                        console.log(chalk.red(new Date().toUTCString(), "------------------- UNSUCCESSFUL SELL ----------------------" ));
                        console.log(chalk.red(new Date().toUTCString(), market, quantity, data.message));
                    }
                });
        }

sellAllCurrencies();