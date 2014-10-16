var assert = require('assert'),
    base91 = require('../lib/base91');

var encoded = base91.encode('node.js rules!');
assert.strictEqual(encoded, 'lref5gTT$FQ;C90ohA');
assert.strictEqual(base91.decode(encoded).toString(), 'node.js rules!');

var buf = new Buffer([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,
                      18,19,20,21,22,23,24,25,26,27,28,29,30,31,127]);
encoded = base91.encode(buf);
assert.strictEqual(encoded, ':C#(:C?hVB$MSiVEwndBAMZRxwFfBB;IW<}YQVH`H');
assert.deepEqual(base91.decode(':C#(:C?hVB$MSiVEwndBAMZRxwFfBB;IW<}YQVH`H'), buf);

// encoding multi-byte utf8 string
var str = 'любовь';
encoded = base91.encode(str);
assert.strictEqual(encoded, 'W>o#74]Dyhr,U2R');
assert.strictEqual(base91.decode(encoded).toString(), str);