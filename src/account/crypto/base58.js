// var crypto = require('crypto');
// var bignum = require('bignum');
//
// var globalBuffer = new Buffer(1024);
// var zerobuf = new Buffer(0);
// var ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
// var ALPHABET_ZERO = ALPHABET[0];
// var ALPHABET_BUF = new Buffer(ALPHABET, 'ascii');
// var ALPHABET_INV = {};
// for(var i=0; i < ALPHABET.length; i++) {
//   ALPHABET_INV[ALPHABET[i]] = i;
// };
//
// // Vanilla Base58 Encoding
// var base58 = {
//   encode2: function(buf) {
//     var str;
//     var x = bignum.fromBuffer(buf);
//     var r;
//
//     if(buf.length < 512) {
//       str = globalBuffer;
//     } else {
//       str = new Buffer(buf.length << 1);
//     }
//     var i = str.length - 1;
//     while(x.gt(0)) {
//       r = x.mod(58);
//       x = x.div(58);
//       str[i] = ALPHABET_BUF[r.toNumber()];
//       console.log(i, r.toNumber())
//       i--;
//     }
//
//     // deal with leading zeros
//     var j=0;
//     while(buf[j] == 0) {
//       str[i] = ALPHABET_BUF[0];
//       j++; i--;
//     }
//
//     return str.slice(i+1,str.length).toString('ascii');
//   },
//
//   decode: function(str) {
//     if(str.length == 0) return zerobuf;
//     var answer = bignum(0);
//     for(var i=0; i<str.length; i++) {
//       answer = answer.mul(58);
//       answer = answer.add(ALPHABET_INV[str[i]]);
//     };
//     var i = 0;
//     while(i < str.length && str[i] == ALPHABET_ZERO) {
//       i++;
//     }
//     if(i > 0) {
//       var zb = new Buffer(i);
//       zb.fill(0);
//       if(i == str.length) return zb;
//       answer = answer.toBuffer();
//       return Buffer.concat([zb, answer], i+answer.length);
//     } else {
//       return answer.toBuffer();
//     }
//   },
// };
//
//
// // if you frequently do base58 encodings with data larger
// // than 512 bytes, you can use this method to expand the
// // size of the reusable buffer
// exports.setBuffer = function(buf) {
//   globalBuffer = buf;
// };
//
// exports.base58 = base58;
// exports.encode2 = base58.encode2;
// exports.decode = base58.decode;
//

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
