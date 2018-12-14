const Buffer = require('buffer/').Buffer;
const BigInteger = require('jsbn').BigInteger;

let globalBuffer = new Buffer(1024);
let zerobuf = new Buffer(0);
let ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
let ALPHABET_ZERO = ALPHABET[0];
let ALPHABET_BUF = new Buffer(ALPHABET, 'ascii');
let ALPHABET_INV = {};
for (let i = 0; i < ALPHABET.length; i++) {
  ALPHABET_INV[ALPHABET[i]] = i;
}

const base58 = {
  encode: function (buf) {
    var str;
    let x = new BigInteger(buf, 16);
    let bi58 = new BigInteger("58", 10);

    if (buf.length < 512) {
      str = globalBuffer;
    } else {
      str = new Buffer(buf.length << 1);
    }
    let r;
    let i = str.length - 1;
    while (x.bitCount() > 0) {
      r = x.mod(bi58);
      x = x.divide(bi58);
      str[i] = ALPHABET_BUF[r.intValue()];
      i--;
    }
    return str.slice(i + 1, str.length).toString('ascii');
  },

  decode: function (str) {
    if (str.length === 0) return zerobuf;
    let answer = new BigInteger("0");
    for (let i = 0; i < str.length; i++) {
      answer = answer.mul(58);
      answer = answer.add(ALPHABET_INV[str[i]]);
    }
    ;
    let i = 0;
    while (i < str.length && str[i] === ALPHABET_ZERO) {
      i++;
    }
    if (i > 0) {
      let zb = new Buffer(i);
      zb.fill(0);
      if (i === str.length) return zb;
      answer = answer.toBuffer();
      return Buffer.concat([zb, answer], i + answer.length);
    } else {
      return answer.toBuffer();
    }
  },
};

// if you frequently do base58 encodings with data larger
// than 512 bytes, you can use this method to expand the
// size of the reusable buffer
exports.setBuffer = function (buf) {
  globalBuffer = buf;
};

exports.base58 = base58;
exports.encode = base58.encode;
exports.decode = base58.decode;
