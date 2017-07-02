
const bittrex = require('../node.bittrex.api');
const APIKEY = 'KEY';
const APISECRET = 'SECRET';

bittrex.options({ 
  'apikey' : APIKEY, 
  'apisecret' : APISECRET, 
  'stream' : false, 
  'verbose' : false, 
  'cleartext' : false 
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