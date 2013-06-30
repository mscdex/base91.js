(function() {
  var AVERAGE_ENCODING_RATIO = 1.2297,
      ENCODING_TABLE = [
        65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80,
        81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 97, 98, 99,100,101,102,
       103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,
       119,120,121,122, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 33, 35,
        36, 37, 38, 40, 41, 42, 43, 44, 46, 47, 58, 59, 60, 61, 62, 63,
        64, 91, 93, 94, 95, 96,123,124,125,126, 34
      ],
      DECODING_TABLE = [
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 62, 90, 63, 64, 65, 66, 91, 67, 68, 69, 70, 71, 91, 72, 73,
        52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 74, 75, 76, 77, 78, 79,
        80,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13, 14,
        15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 81, 91, 82, 83, 84,
        85, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
        41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 86, 87, 88, 89, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91
      ];

  var i;

  var hasNode = (process && process.versions && process.versions.node),
      hasTypedArray = (typeof Uint8Array !== undefined);

  var base91 = {
    encode: function(data) {
      var len = data.length,
          output = '', ebq = 0, en = 0, ev, j, byte;

      if (typeof data === 'string') {
        for (i = 0; i < len; ++i) {
          byte = data.charCodeAt(i);
          j = (byte > 255 ? 0 : 1);
          for (; j < 2; ++j) {
            if (j === 0)
              ebq |= ((byte & 0xFF00) / 256) << en;
            else
              ebq |= (byte & 255) << en;
            en += 8;
            if (en > 13) {
              ev = ebq & 8191;
              if (ev > 88) {
                ebq >>= 13;
                en -= 13;
              } else {
                ev = ebq & 16383;
                ebq >>= 14;
                en -= 14;
              }
              output += String.fromCharCode(ENCODING_TABLE[ev % 91]);
              output += String.fromCharCode(ENCODING_TABLE[parseInt(ev / 91, 10)]);
            }
          }
        }
      } else {
        for (i = 0; i < len; ++i) {
          ebq |= (data[i] & 255) << en;
          en += 8;
          if (en > 13) {
            ev = ebq & 8191;
            if (ev > 88) {
              ebq >>= 13;
              en -= 13;
            } else {
              ev = ebq & 16383;
              ebq >>= 14;
              en -= 14;
            }
            output += String.fromCharCode(ENCODING_TABLE[ev % 91]);
            output += String.fromCharCode(ENCODING_TABLE[parseInt(ev / 91, 10)]);
          }
        }
      }

      if (en > 0) {
        output += String.fromCharCode(ENCODING_TABLE[ebq % 91]);
        if (en > 7 || ebq > 90)
          output += String.fromCharCode(ENCODING_TABLE[parseInt(ebq / 91, 10)]);
      }

      return output;
    },
    decode: function(data) {
      var len = data.length,
          estimatedSize = Math.round(len / AVERAGE_ENCODING_RATIO),
          dbq = 0, dn = 0, dv = -1, i, o = -1, byte,
          output = new Array(estimatedSize);

      if (typeof data === 'string') {
        for (i = 0; i < len; ++i) {
          byte = data.charCodeAt(i);
          if (DECODING_TABLE[byte] === 91)
            continue;
          if (dv === -1)
            dv = DECODING_TABLE[byte];
          else {
            dv += DECODING_TABLE[byte] * 91;
            dbq |= dv << dn;
            dn += ((dv & 8191) > 88 ? 13 : 14);
            do {
              if (++o >= estimatedSize)
                output.push(dbq & 0xFF);
              else
                output[o] = dbq & 0xFF;
              dbq >>= 8;
              dn -= 8;
            } while (dn > 7);
            dv = -1;
          }
        }
      } else {
        for (i = 0; i < len; ++i) {
          byte = data[i];
          if (DECODING_TABLE[byte] === 91)
            continue;
          if (dv === -1)
            dv = DECODING_TABLE[byte];
          else {
            dv += DECODING_TABLE[byte] * 91;
            dbq |= dv << dn;
            dn += ((dv & 8191) > 88 ? 13 : 14);
            do {
              if (++o >= estimatedSize)
                output.push(dbq & 0xFF);
              else
                output[o] = dbq & 0xFF;
              dbq >>= 8;
              dn -= 8;
            } while (dn > 7);
            dv = -1;
          }
        }
      }

      if (dv !== -1) {
        if (++o >= estimatedSize)
          output.push(dbq | dv << dn);
        else
          output[o] = (dbq | dv << dn);
      }

      if (o > -1 && o < estimatedSize - 1)
        output = output.slice(0, o + 1);

      var ret;
      if (hasNode)
        ret = new Buffer(output);
      else if (hasTypedArray) {
        ret = new Uint8Array(output.length);
        for (i = 0, len = output.length; i < len; ++i)
          ret[i] = output[i];
      } else
        ret = output;

      return ret;
    }
  };

  if (hasNode)
    module.exports = base91;
  else
    window.base91 = base91;
})();