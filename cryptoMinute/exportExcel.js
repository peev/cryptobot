var mongoXlsx = require('mongo-xlsx')
var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://localhost/BittrexOneMinuteData'

MongoClient.connect(url, function (err, db) {
  if (err) throw err

  db.listCollections().toArray(function (err, collInfos) {

    for (var p = 1, len = collInfos.length; p < len; p++) {
      let collectionName = collInfos[p].name

      db.collection(collectionName).find().sort({_id: -1}).limit(1000).toArray(function (err, result) {
        if (err) throw err

        result = result.reverse().map(x=> {
          delete x._id
          delete x.Timestamp
          return x
        })

        let model = mongoXlsx.buildDynamicModel(result)
        mongoXlsx.mongoData2Xlsx(result, model, {
          fileName: collectionName + '.xlsx',
          path: './exports'
        }, function (err, res2) {
          console.log('File saved at:', res2.fullPath)
        })
      })
    }
  })
})

