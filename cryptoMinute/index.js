var bittrex = require('node.bittrex.api')
var moment = require('moment')

var https = require('https');
https.globalAgent.maxSockets = 1;

var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost/BittrexOneMinuteData'
var database

var btcmarkets = []
const currency = 'BTC'

function getMarkets() {
    return new Promise((resolve, reject) => {
        bittrex.getmarkets(function (data) {
            data.result.forEach(function (curData) {
                if (curData.MarketName.startsWith(currency)) {
                    btcmarkets.push(curData.MarketName)
                }
            })

            resolve(btcmarkets)
        })
    })
}

function writeCandlesToDB(btcmarkets) {
    btcmarkets.forEach(m => {
        var market = database.collection(m)
        var last = market.find().sort({'_id': -1}).limit(1).toArray()
            .then(res => {
                let lastTimeStamp
                if (res.length !== 0) {
                    lastTimeStamp = res[0].Timestamp
                }

                bittrex.getcandles({
                    marketName: m,
                    tickInterval: 'oneMin', // intervals are keywords
                }, function (data, err) {
                    if (err) {
                        console.log('---------------------------')
                        console.log(m)
                        console.log(err.message)
                        console.log('---------------------------')
                        return
                    }
                    let result
                    if (lastTimeStamp) {
                        result = data.result.filter(x => {
                            console.log(lastTimeStamp)
                            console.log(x.T)
                            console.log(moment(Date.parse(x.T)).toString())
                            return moment(x.T).isAfter(lastTimeStamp)
                        })
                    } else {
                        result = data.result;
                    }
                    result = result.map(x => {
                        let date = new Date(Date.parse(x.T))
                        let formatted = moment(date).format('MM/DD/YYYY')
                        let time = moment(x.T).format('hh:mm A')
                        return {
                            Date: formatted,
                            Time: time,
                            Open: x.O,
                            High: x.H,
                            Low: x.L,
                            Close: x.C,
                            Volume: x.V,
                            Timestamp: x.T
                        }
                    })

                    market.insertMany(result)
                })
            })
    })
}


MongoClient.connect(url, function (err, db) {
    if (err) throw err
    database = db
    // getMarkets()
    //     .then(writeCandlesToDB)

    getMarkets()
        .then(getLastWeekProfitableCurrencies)
        .then(console.log);


})


function getLastWeekProfitableCurrencies() {
    let weekInMins = 7 * 24 * 60;
    let promises = [];
    let profitable = [];

    for (let market of btcmarkets) {
        promises.push(database.collection(market)
            .find()
            .sort({_id: -1})
            .limit(weekInMins)
            .toArray()
            .then(data => {
                let average = data.reduce((a, b) => {
                    return a + b.Close;
                }, 0) / data.length

                let currentPrice = data[0].Close;
                let ratio = (currentPrice - average) / currentPrice * 100

                let averageVolume
                if (ratio < 0 && ratio < -30) {

                    let marketResult = {
                        marketName: market,
                        currentPrice: currentPrice,
                        averagePrice: average,
                        downRatio: ratio,
                        observedPeriod: '7d'
                    }
                    profitable.push(marketResult)
                }
            }))
    }

    return Promise.all(promises)
        .then(() => {
            return profitable
        })
}


function getThreeDayProfitableCurrencies() {
    let weekInMins = 3 * 24 * 60;
    let promises = [];
    let profitable = [];

    for (let market of btcmarkets) {
        promises.push(database.collection(market)
            .find()
            .sort({_id: -1})
            .limit(weekInMins)
            .toArray()
            .then(data => {
                let average = data.reduce((a, b) => {
                    return a + b.Close;
                }, 0) / data.length

                let currentPrice = data[0].Close;
                let ratio = (currentPrice - average) / currentPrice * 100

                let averageVolume
                if (ratio < 0 && ratio < -50) {
                    profitable.push(market)
                }
            }))
    }

    return Promise.all(promises)
        .then(() => {
            return profitable
        })
}

