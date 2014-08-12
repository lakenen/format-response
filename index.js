var stream = require('stream')
  , concat = require('concat-stream')
  , http = require('http')
  , DuplexCombination = require('duplex-combination');

module.exports = function (opt) {
  opt = opt  || {}

  var input = new stream.PassThrough()
    , output = new stream.PassThrough()
    , dup = new DuplexCombination(output,input)

  opt.ignoreHeaders = (opt.ignoreHeaders || []).map(function (s) {
    return s.toLowerCase()
  })

  dup.on('pipe', function (res) {
    var statusText, header = ''

    if (opt.printRequestHeader && res.req) {
      header += formatRequestHeader(res.req, opt.ignoreHeaders)
    }

    header += formatResponseHeader(res, opt.ignoreHeaders)

    if (opt.ignoreBody) {
      return output.end(header)
    }

    if (opt.prettifyJSON && res.headers['content-type'] === 'application/json') {
      input.pipe(concat(function (json) {
        json = JSON.stringify(JSON.parse(json), true, 2)
        output.end(header + json)
      }))
    } else {
      output.write(header)
      input.pipe(output)
      res.on('end', function () {
        // force the output to end when response ends
        // not sure why, but this is necessary sometimes :(
        output.end()
      })
    }
  })

  return dup
}

function formatHeaderObject(headers, ignored) {
  return Object.keys(headers).map(function (h) {
    if (ignored.indexOf(h) > -1) return false
    return uppercaseWords(h) + ': ' + headers[h]
  }).filter(Boolean).join('\n')
}

function formatRequestHeader(req, ignored) {
  var header = ''
  if (req._header) {
    header += req._header.split('\n').filter(function (line) {
      var headerName = line.toLowerCase().split(':')[0]
      return ignored.indexOf(headerName) < 0
    }).join('\n')
  } else {
    header += req.method + ' ' + req.path + ' HTTP/1.1\n'
    header += formatHeaderObject(req._headers, ignored) + '\n\n'
  }
  return header
}

function formatResponseHeader(res, ignored) {
  var statusText = res.statusCode + ' ' + http.STATUS_CODES[res.statusCode]
    , header = 'HTTP/1.1 ' + statusText + '\n'

  header += formatHeaderObject(res.headers, ignored)

  return header + '\n\n'
}

function uppercaseWords(str) {
  return str.replace(/(^|\W)(\w)/g, function (m) {
    return m.toUpperCase()
  })
}
