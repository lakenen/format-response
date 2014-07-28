# format-response

Formats http(s) responses a la `cURL -i` as a transform stream.


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

`Array` - list of header names to ignore (case-insensitive)


## Running Tests

Make sure you have the development dependencies installed by running `npm install`, then you should be able to run the tests with `npm test`.


## License

([The MIT License](LICENSE))

Copyright 2014 Cameron Lakenen