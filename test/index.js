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
        str = str.toString().toLowerCase()
        t.ok(str.indexOf('http/1.1 200 ok') > -1, 'printed status line')
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
        str = str.toString().toLowerCase()
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
        str = str.toString().toLowerCase()
        t.ok(str.indexOf('hello, world!') > -1, 'printed body')
        server.close()
      }))
    })
  })
})

test('should ignore headers properly', function (t) {
  t.plan(3)
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
          'should-not-be-there',
          'Should-Not-Be-There',
          'should-not-be-there-either'
        ]
      })).pipe(concat(function (str) {
        str = str.toString().toLowerCase()
        t.ok(str.indexOf('beep-boop: bop') > -1, 'did not ignore non-ignored header')
        t.equal(str.indexOf('should-not-be-there'), -1, 'ignored header')
        t.equal(str.indexOf('should-not-be-there-either'), -1, 'ignored another header')
        server.close()
      }))
    })
  })
})

test('should prettify body when prettifyJSON is true', function (t) {
  t.plan(1)
  var server = http.createServer(function (req, res) {
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({
      beep: 'boop',
      bop: {
        hello: 'world'
      }
    }))
  }).listen(0, function () {
    var port = server.address().port
    http.get('http://localhost:' + port, function (res) {
      res.pipe(format({ prettifyJSON: true })).pipe(concat(function (str) {
        str = str.toString().toLowerCase()
        t.ok(str.indexOf('{\n  "beep": "boop",\n  "bop": {\n    "hello": "world"\n  }\n}') > -1, 'printed body')
        server.close()
      }))
    })
  })
})

test('should print request headers when printRequestHeaders is true', function (t) {
  t.plan(1)
  var server = http.createServer(function (req, res) {
    res.end()
  }).listen(0, function () {
    var port = server.address().port
    http.get('http://localhost:' + port, function (res) {
      res.pipe(format({ printRequestHeader: true })).pipe(concat(function (str) {
        str = str.toString().toLowerCase()
        t.ok(true, 'printed request headers')
        server.close()
      }))
    })
  })
})

test('should not print body when ignoreBody is true', function (t) {
  var body = 'beep boop bop'
  t.plan(1)
  var server = http.createServer(function (req, res) {
    res.end(body)
  }).listen(0, function () {
    var port = server.address().port
    http.get('http://localhost:' + port, function (res) {
      res.pipe(format({ ignoreBody: true })).pipe(concat(function (str) {
        str = str.toString().toLowerCase()
        t.equal(str.indexOf(body), -1, 'ignored body')
        server.close()
      }))
    })
  })
})
