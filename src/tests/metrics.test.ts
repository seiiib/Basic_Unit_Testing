import { expect } from 'chai'
import { Metric, MetricsHandler } from '../metrics'
import { LevelDB } from "../leveldb"

const dbPath: string = 'db_test'
var dbMet: MetricsHandler

describe('Metrics', function () {

  before(function () {
    LevelDB.clear(dbPath)
    dbMet = new MetricsHandler(dbPath)
  })

  after(function () {
    dbMet.closeDB()
  })

  describe('#get', function () {
    it('should get empty array on non existing group', function () {
      dbMet.get("0", function (err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })
  })

  describe('#save', function () {
    
    it('should save return an array with 1 item', function () {
      dbMet.get("0", function (err: Error | null, result?: Metric[]) {
        expect(err).to.be.null
        expect(result).to.not.be.undefined
        expect(result).to.be.empty
      })
    })

    it('', function () {
      var met: Metric[] = []
        met.push(new Metric('1221122123', 10))
      dbMet.save("1",met,(err: Error | null, result?:Metric[]) => {
        dbMet.get("1", (err: Error | null, result?: Metric[]) => {
          expect(err).to.be.null
          expect(result).to.not.be.undefined
          console.log(result)
            if(result)
              expect(result[0].value).to.equal(10)
        })
      })
    })

  })

})