var mongoXlsx = require('mongo-xlsx');
const chalk = require('chalk');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/BittrexMarketsState3";

MongoClient.connect(url, function (err, db) {
  if (err) throw err;
  db.listCollections().toArray(function (err, collInfos) {

    for (var p = 1, len = collInfos.length; p < len; p++) {
      if (collInfos[p].name.startsWith('btc-')) {
        let collectionName = collInfos[p].name;

        db.collection(collectionName).find().toArray(function (err, result) {
          var collectionLabel;
          // collectionLabel
          if (err) throw err;
          console.log(result);
          let data = []
          for (var i = 1, len = result.length; i < len; i++) {
            var curData = result[i];
            curData.TimeStamp = curData.TimeStamp.toISOString();
            curData.Created = curData.Created.toISOString();
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

