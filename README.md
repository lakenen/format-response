# format-response

Formats http(s) responses a la `curl -i` as a duplex stream.


## Installation

```
npm install format-response
```


## Usage

```js
var format = require('format-response')
http.get('http://example.com', function (res) {
  res.pipe(format()).pipe(process.stdout)
})
```


## Options

`format(options)`

### ignoreHeaders

`Array` - list of header names to ignore (case-insensitive). Default: `[]`

### prettifyJSON

`boolean` - if the response type is `'application/json'`, prettify the JSON output. Default: `false`

### printRequestHeader

`boolean` - print the request header before the response. Default: `false`


## Running Tests

Make sure you have the development dependencies installed by running `npm install`, then you should be able to run the tests with `npm test`.


## License

([The MIT License](LICENSE))

Copyright 2014 Cameron Lakenen
