var format = require('..')
  , concat = require('concat-stream')
  , http = require('http')
  , test = require('tape')

test('should print status line', function (t) {
  t.plan(1)
  var server = http.createServer(function (req, res) {
    res.end()
  }).listen(0, function () {
    var port = server.address().port
    http.get('http://localhost:' + port, function (res) {
      res.pipe(format()).pipe(concat(function (str) {
        str = str.toString()
        t.ok(str.indexOf('HTTP/1.1 200 OK') > -1, 'printed status line')
        server.close()
      }))
    })
  })
})

test('should print headers', function (t) {
  t.plan(1)
  var server = http.createServer(function (req, res) {
    res.setHeader('beep-boop', 'bop')
    res.end()
  }).listen(0, function () {
    var port = server.address().port
    http.get('http://localhost:' + port, function (res) {
      res.pipe(format()).pipe(concat(function (str) {
        str = str.toString()
        t.ok(str.indexOf('beep-boop: bop') > -1, 'printed header')
        server.close()
      }))
    })
  })
})

test('should print body', function (t) {
  t.plan(1)
  var server = http.createServer(function (req, res) {
    res.end('hello, world!')
  }).listen(0, function () {
    var port = server.address().port
    http.get('http://localhost:' + port, function (res) {
      res.pipe(format()).pipe(concat(function (str) {
        str = str.toString()
        t.ok(str.indexOf('hello, world!') > -1, 'printed body')
        server.close()
      }))
    })
  })
})

test('should ignore headers properly', function (t) {
  t.plan(4)
  var server = http.createServer(function (req, res) {
    res.setHeader('Should-Not-Be-There', 'foo')
    res.setHeader('should-not-be-there-either', 'bar')
    res.setHeader('beep-boop', 'bop')
    res.end()
  }).listen(0, function () {
    var port = server.address().port
    http.get('http://localhost:' + port, function (res) {
      res.pipe(format({
        ignoreHeaders: [
          'Should-Not-be-There',
          'should-not-be-there-either'
        ]
      })).pipe(concat(function (str) {
        str = str.toString()
        t.ok(str.indexOf('beep-boop: bop') > -1, 'did not ignore non-ignored header')
        t.equal(str.indexOf('should-not-be-there'), -1, 'ignored header')
        t.equal(str.indexOf('Should-Not-Be-There'), -1, 'ignored capitalized header')
        t.equal(str.indexOf('should-not-be-there-either'), -1, 'ignored another header')
        server.close()
      }))
    })
  })
})
