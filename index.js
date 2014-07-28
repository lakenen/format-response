var through = require('through2')
  , http = require('http')

module.exports = function (opt) {
  opt = opt  || {}
  var stream = through()

  stream.on('pipe', function (res) {
    stream.push('HTTP/1.1 ' + res.statusCode + ' ' + http.STATUS_CODES[res.statusCode] + '\n')
    stream.push(formatHeaders(res.headers, opt.ignoreHeaders))
    stream.push('\n\n')
  })

  return stream
}

function formatHeaders(headers, ignored) {
  ignored = (ignored || []).map(function (s) {
    return s.toLowerCase()
  })
  var str = Object.keys(headers).map(function (h) {
    if (ignored.indexOf(h) > -1) return false
    return h + ': ' + headers[h]
  }).filter(Boolean).join('\n')
  return str
}
