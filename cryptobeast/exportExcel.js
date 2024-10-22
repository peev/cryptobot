var mongoXlsx = require('mongo-xlsx');
const chalk = require('chalk');
var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost/BittrexTradingAppEchange-temp-1499871538787";
var url = 'mongodb://cb-admin:0887pass@ec2-34-203-208-180.compute-1.amazonaws.com:27017/cryptobotDB';

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  db.listCollections().toArray(function (err, collInfos) {

    for (var p = 1, len = collInfos.length; p < len; p++) {
      if (collInfos[p].name.startsWith('BTC-INFX')) {
        let collectionName = collInfos[p].name;

        db.collection(collectionName).find().sort( { _id : -1 } ).limit(1000).toArray(function (err, result) {
          var collectionLabel;
          // collectionLabel
          if (err) throw err;
          console.log(result);
          let data = [];
          for (var i = 1, len = result.length; i < len; i++) {
            var curData = result[i];
            // curData.TimeStamp = curData.TimeStamp.toISOString();
            // curData.Created = curData.Created.toISOString();
            data.push(curData);
          }

          let model = mongoXlsx.buildDynamicModel(data);
          mongoXlsx.mongoData2Xlsx(data, model, { fileName: collectionName + '.xlsx', path: './exports' }, function (err, res2) {
            console.log('File saved at:', res2.fullPath);
          });

        })
      }
    }

  });
});

