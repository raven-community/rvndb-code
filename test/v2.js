const assert = require('assert');
const diff = require('deep-diff').diff;
const rvndb-code = require('../v2/index')
const comp = function(actual, expected) {
  let difference = diff(actual, expected)
  assert.equal(typeof difference, 'undefined')
}
describe('v2', function() {
  describe('decode', function() {
    it('should replace b1 with a hex encoded version', function() {
      let src = {
        "out": [{
          "i": 0,
          "b0": { op: 106 },
          "b1": "bQI="
        }]
      }

      let encoding = { "out.b1": "hex" }

      let expected = {
        "out": [{
          "i": 0,
          "b0": { op: 106 },
          "b1": "6d02"
        }]
      }

      let actual = rvndb-code.decode(src, encoding)
      comp(actual, expected)
    })
  })
  describe('encode', function() {
    it('should transform out.b* attributes', function() {
      let src = {
        find: { "out.b1": "6d02" }
      }
      let encoding = { "out.b1": "hex" }
      let expected = {
        find: {
          "out.b1": Buffer.from("6d02", "hex").toString("base64")
        }
      }
      let actual = rvndb-code.encode(src, encoding)
      comp(actual, expected)
    })
    it('should transform out.b* attributes inside an array', function() {
      let src = {
        find: { "out.b1": ["6d02", "6d0c"] }
      }
      let encoding = { "out.b1": "hex" }
      let expected = {
        find: {
          "out.b1": [
            Buffer.from("6d02", "hex").toString("base64"),
            Buffer.from("6d0c", "hex").toString("base64")
          ]
        }
      }
      let actual = rvndb-code.encode(src, encoding)
      comp(actual, expected)
    })
    it('should transform out.b* attributes inside $regex', function() {
      let src = {
        find: {
          "out.b1": {
            "$not": "6d02"
          }
        }
      }
      let encoding = { "out.b1": "hex" }
      let expected = {
        find: {
          "out.b1": {
            $not: Buffer.from("6d02", "hex").toString("base64")
          }
        }
      }
      let actual = rvndb-code.encode(src, encoding)
      comp(actual, expected)
    })


    it("should NOT transform objects", function() {
      let src = {
        find: {
          "out.b1": {
            $exists: true
          }
        }
      }
      let encoding = { "out.b1": "hex" }
      let expected = {
        find: {
          "out.b1": {
            $exists: true
          }
        }
      }
      let actual = rvndb-code.encode(src, encoding)
      comp(actual, expected)
    })

    it('should correctly transform compound queries 1', function() {
      let src = {
        find: {
          "$text": {
            "$search": "bet"
          },
          "out.b1": "6d02"
        }
      }
      let encoding = { "out.b1": "hex" }
      let expected = {
        find: {
          "$text": {
            "$search": "bet"
          },
          "out.b1": "bQI="
        }
      }
      let actual = rvndb-code.encode(src, encoding)
      comp(actual, expected)
    })
    it('should correctly transform compound queries 2', function() {
      let src = {
        find: {
          "$text": {
            "$search": "bet"
          },
          "out.b1": {
            $exists: true
          }
        }
      }
      let encoding = { "out.b1": "hex" }
      let expected = {
        find: {
          "$text": {
            "$search": "bet"
          },
          "out.b1": {
            $exists: true
          }
        }
      }
      let actual = rvndb-code.encode(src, encoding)
      comp(actual, expected)
    })
  });



});

