import {getCurveByName} from "./crypto/ecurve";

const Buffer = require('buffer/').Buffer;
const hash = require('hash.js');

const BigInteger = require('jsbn').BigInteger;

const secp256k1 = getCurveByName("secp256k1");

import Publickey from "./PublicKey";

class privateKey {
  /**
   @private see static functions
   @param {BigInteger}
   */
  constructor(d) {
    this.d = d;
  }

  static fromBuffer(buf) {
    return new privateKey(new BigInteger(buf, 16));
  }

  /** @arg {string} seed - any length string.  This is private, the same seed produces the same private key every time.  */
  static fromSeed(seed) {
    if (!(typeof seed === "string")) {
      throw new Error("seed must be of type string");
    }
    return privateKey.fromBuffer(hash.sha256().update(seed).digest('hex'));
  }

  // toWif() {
  //   let private_key = this.toBuffer();
  //   // checksum includes the version
  //   private_key = Buffer.concat([Buffer.from([0x80]), private_key]);
  //   let checksum = hash.sha256().update(private_key).digest('hex');
  //
  //   checksum = privatekey.sha256(checksum);
  //   checksum = checksum.slice(0, 4);
  //   let private_wif = Buffer.concat([private_key, checksum]);
  //   return encode(private_wif);
  // }

  static sha256(val) {
    return Buffer.from(hash.sha256().update(val).digest())
  }

  toPublicKey() {
    if (this.public_key) {
      return this.public_key;
    }
    return (this.public_key = Publickey.fromPoint(this.toPublicKeyPoint()));
  }

  toBuffer() {
    return this.d.toBuffer(32);
  }

  toPublicKeyPoint() {
    return secp256k1.G.multiply(this.d);
  }
}

export default privateKey;
