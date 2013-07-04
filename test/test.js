var assert = require('assert'),
    base91 = require('../lib/base91');

assert.deepEqual(base91.encode('node.js rules!'), 'lref5gTT$FQ;C90ohA');
assert.deepEqual(base91.decode('lref5gTT$FQ;C90ohA').toString(), 'node.js rules!');

var buf = new Buffer([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,
                      18,19,20,21,22,23,24,25,26,27,28,29,30,31,127]);
assert.deepEqual(base91.encode(buf), ':C#(:C?hVB$MSiVEwndBAMZRxwFfBB;IW<}YQVH`H');
assert.deepEqual(base91.decode(':C#(:C?hVB$MSiVEwndBAMZRxwFfBB;IW<}YQVH`H'), buf);
