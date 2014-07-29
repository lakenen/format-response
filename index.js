var stream = require('stream')
  , concat = require('concat-stream')
  , http = require('http')
  , DuplexCombination = require('duplex-combination');

module.exports = function (opt) {
  opt = opt  || {}

  var input = new stream.PassThrough()
    , output = new stream.PassThrough()
    , dup = new DuplexCombination(output,input)

  dup.on('pipe', function (res) {
    var statusText = res.statusCode + ' ' + http.STATUS_CODES[res.statusCode]
    var header = 'HTTP/1.1 ' + statusText + '\n'
    header += formatHeaders(res.headers, opt.ignoreHeaders) + '\n\n'

    if (opt.prettifyJSON && res.headers['content-type'] === 'application/json') {
      input.pipe(concat(function (json) {
        json = JSON.stringify(JSON.parse(json), true, 2)
        output.end(header + json)
      }))
    } else {
      output.write(header)
      input.pipe(output)
    }
  })

  return dup
}

function formatHeaders(headers, ignored) {
  ignored = (ignored || []).map(function (s) {
    return s.toLowerCase()
  })
  var str = Object.keys(headers).map(function (h) {
    if (ignored.indexOf(h) > -1) return false
    return uppercaseWords(h) + ': ' + headers[h]
  }).filter(Boolean).join('\n')
  return str
}

function uppercaseWords(str) {
  return str.replace(/(^|\W)(\w)/g, function (m) {
    return m.toUpperCase()
  })
}
