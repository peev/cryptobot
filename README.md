CroyptoBot based on node.bitterex.api
=========


Node Bittrex API library - https://github.com/n0mad01/node.bittrex.api
Bitterex Api Docs - https://bittrex.com/home/api

Installation
----


Fetch the project via git:
```sh
$ git clone https://github.com/peev/cryptobot.git
```
then meet the package dependencies:
```sh
$ cd cryptobot/
$ npm install
```
then run the cryptobeast/app.js via nodemon VSCode node debuger:
```sh
$ nodemon cryptobeast/app.js
```


First steps
----

##### configure
```javascript
const APIKEY = 'your_key';
const APISECRET = 'your_secret';
```

By default the returned data by bittrex.node.api is an object, in order to get clear text you have to add the option **cleartext** (streams will always return text):
```javascript
'cleartext' : true
```

The baseUrl itself can also be set via options
```javascript
'baseUrl' : 'https://bittrex.com/api/v1'
```

Websockets
--
following methods are implemented:
> websockets.listen, websockets.subscribe

listen example
```javascript
bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        console.log('Ticker Update for '+ marketsDelta.MarketName, marketsDelta);
      });
    });
  }
});
```

subscribe example
```javascript
bittrex.websockets.subscribe(['BTC-ETH','BTC-SC','BTC-ZEN'], function(data) {
  if (data.M === 'updateExchangeState') {
    data.A.forEach(function(data_for) {
      console.log('Market Update for '+ data_for.MarketName, data_for);
    });
  }
});
```

Streams - please notice that streams will be removed from future versions
--
To activate Streaming simply add to your options:
```javascript
'stream' : true
```

Examples
--
After configuration you can use the object right away:
example #1
```javascript
bittrex.getmarketsummaries( function( data ) {
  for( var i in data.result ) {
    bittrex.getticker( { market : data.result[i].MarketName }, function( ticker ) {
      console.log( ticker );
    });
  }
});
```

example #2
```javascript
bittrex.getbalance({ currency : 'BTC' }, function( data ) {
  console.log( data );
});
```


Libraries
--

Websockets depends on the following npm packages:
- signalR websockets client https://www.npmjs.com/package/signalrjs
- jsonic JSON parser https://www.npmjs.com/package/jsonic

Streaming depends on the following npm packages (will be removed in future versions):
- JSONStream https://www.npmjs.org/package/JSONStream
- event-stream https://www.npmjs.org/package/event-stream

Other libraries utilized:
- request https://www.npmjs.org/package/request

For HmacSHA512 this package is using a part of Googles Crypto.js (the node crypt package could not provide any appropriate result).
- http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/hmac-sha512.js

Methods
----

Optional parameters may have to be looked up at https://bittrex.com/Home/Api.

> It may happen that some Bittrex API methods are missing, also they could have been forgotten in the documentation. In this case, if this strikes you, feel free to open a issue or send me a pull request.

> Also: the method **sendCustomRequest** enables completely custom requests, regardless the specific API methods.

##### sendCustomRequest 
- url           String
- callback      Function
- credentials   Boolean     optional    whether the credentials should be applied to the request/stream or not, default is set to false.

example #1
```javascript
var url = 'https://bittrex.com/api/v1.1/public/getticker?market=BTC-LTC';
bittrex.sendCustomRequest( url, function( data ) {
  console.log( data );
});
```

example #2 (credentials applied to request/stream)
```javascript
bittrex.sendCustomRequest( 'https://bittrex.com/api/v1.1/account/getbalances?currency=BTC', function( data ) {
  console.log( data );
}, true );

will result in (the Header is being set too):
https://bittrex.com/api/v1.1/account/getbalances?currency=BTC&apikey=API_KEY&nonce=4456490600
```

##### getticker
```javascript
bittrex.getticker( { market : 'BTC-LTC' }, function( data ) {
  console.log( data );
});
```

##### getbalances
```javascript
bittrex.getbalances( function( data ) {
  console.log( data );
});
```

##### getmarkethistory
```javascript
bittrex.getmarkethistory({ market : 'BTC-LTC' }, function( data ) {
  console.log( data );
});
```

##### getmarketsummaries
```javascript
bittrex.getmarketsummaries( function( data ) {
  console.log( data );
});
```

##### getmarketsummary
```javascript
bittrex.getmarketsummary( { market : 'BTC-LTC'}, function( data ) {
  console.log( data );
});
```

##### getorderbook
```javascript
bittrex.getorderbook({ market : 'BTC-LTC', depth : 10, type : 'both' }, function( data ) {
  console.log( data );
});
```

##### getwithdrawalhistory
```javascript
bittrex.getwithdrawalhistory({ currency : 'BTC' }, function( data ) {
  console.log( data );
});
```

##### getdepositaddress
```javascript
bittrex.getdepositaddress({ currency : 'BTC' }, function( data ) {
  console.log( data );
});
```

##### getdeposithistory
```javascript
bittrex.getdeposithistory({ currency : 'BTC' }, function( data ) {
  console.log( data );
});
```

##### getbalance
```javascript
bittrex.getbalance({ currency : 'BTC' }, function( data ) {
  console.log( data );
});
```

##### withdraw
```javascript
bittrex.withdraw({ currency : 'BTC', quantity : '1.5112', address : 'THE_ADDRESS' }, function( data ) {
  console.log( data );
});
```

##### donations welcome! 
BTC
> 17gtixgt4Q8hZcSictQwj5WUdgFjegCt36

