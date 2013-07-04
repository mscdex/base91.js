var fs = require('fs'), assert = require('assert');
var RE_COMMAS = /(\d)(?=(\d{3})+$)/g;
var base91 = require('../lib/base91'),
    first = true, time, result64, result91, file, prefix;

function format(n) {
  return (''+n).replace(RE_COMMAS, '$1,') + ' bytes';
}

if (base91.encode.toString() === 'function () { [native code] }')
  console.log('Using C++ addon for base91 encode/decode ...');
else
  console.log('Using pure JavaScript for base91 encode/decode ...');
console.log('');

fs.readdirSync(__dirname + '/files').forEach(function(f) {
  if (first)
    first = false;
  else
    console.log('----------');

  file = fs.readFileSync(__dirname + '/files/' + f);
  prefix = '[' + f + '] ';

  console.log(prefix + 'Original size: ' + format(file.length) + ' (100%)');
  console.log('');

  console.time(prefix + 'base64 encode');
  result64 = file.toString('base64');
  console.timeEnd(prefix + 'base64 encode');
  console.log(prefix + 'base64 encoded size: '
              + format(result64.length)
              + ' (' + (result64.length / file.length * 100).toFixed(2) + '%)');
  console.time(prefix + 'base64 decode');
  result64 = new Buffer(result64, 'base64');
  console.timeEnd(prefix + 'base64 decode');
  console.log('');

  console.time(prefix + 'base91 encode');
  result91 = base91.encode(file);
  console.timeEnd(prefix + 'base91 encode');
  console.log(prefix + 'base91 encoded size: '
              + format(result91.length)
              + ' (' + (result91.length / file.length * 100).toFixed(2) + '%)');
  console.time(prefix + 'base91 decode');
  result91 = base91.decode(result91);
  console.timeEnd(prefix + 'base91 decode');

  assert.deepEqual(file, result64, prefix
                                   + 'Base64 decoded does not match original');
  assert.deepEqual(file, result91, prefix
                                   + 'Base91 decoded does not match original');
});
