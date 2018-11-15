import {getCurveByName} from "./crypto/ecurve";
import {encode, decode} from "bs58";

const Buffer = require('buffer/').Buffer;
const hash = require('hash.js');

// const BigInteger = require('jsbn').BigInteger;

const secp256k1 = getCurveByName("secp256k1");

import createHash from "create-hash";
import PublicKey from "./PublicKey";

function sha256(data, encoding) {
  return createHash("sha256")
    .update(data)
    .digest(encoding);
}

class _privatekey {
  /**
   @private see static functions
   @param {BigInteger}
   */
  constructor(d) {
    this.d = d;
    console.log(d)
  }

  static fromBuffer(buf) {

    console.log("Get private key")
    return new _privatekey(new BigInteger(buf, 16));
  }

  /** @arg {string} seed - any length string.  This is private, the same seed produces the same private key every time.  */
  static fromSeed(seed) {
    // generate_private_key
    if (!(typeof seed === "string")) {
      throw new Error("seed must be of type string");
    }
    let h = hash.sha256().update(seed).digest('hex');
    // let b = Buffer.from(h, 'hex')
    // console.log("1", b);
    // console.log("2", sha256(seed));
    return _privatekey.fromBuffer(h);
  }

  toWif() {
    let private_key = this.toBuffer();
    // checksum includes the version
    private_key = Buffer.concat([Buffer.from([0x80]), private_key]);
    let checksum = hash.sha256().update(private_key).digest('hex');

    checksum = _privatekey.sha256(checksum);
    checksum = checksum.slice(0, 4);
    let private_wif = Buffer.concat([private_key, checksum]);
    return encode(private_wif);
  }

  static sha256(val) {
    return Buffer.from(hash.sha256().update(val).digest())
  }

  toPublicKey() {
    if (this.public_key) {
      return this.public_key;
    }
    return (this.public_key = PublicKey.fromPoint(this.toPublicKeyPoint()));
  }

  toBuffer() {
    return this.d.toBuffer(32);
  }

  toPublicKeyPoint() {
    return secp256k1.G.multiply(this.d);
  }

  //
  // /** ECIES */
  // get_shared_secret(public_key, legacy = false) {
  //   public_key = toPublic(public_key);
  //   let KB = public_key.toUncompressed().toBuffer();
  //   let KBP = Point.fromAffine(
  //     secp256k1,
  //     BigInteger.fromBuffer(KB.slice(1, 33)), // x
  //     BigInteger.fromBuffer(KB.slice(33, 65)) // y
  //   );
  //   let r = this.toBuffer();
  //   let P = KBP.multiply(BigInteger.fromBuffer(r));
  //   let S = P.affineX.toBuffer({size: 32});
  //   /*
  //   the input to sha512 must be exactly 32-bytes, to match the c++ implementation
  //   of get_shared_secret.  Right now S will be shorter if the most significant
  //   byte(s) is zero.  Pad it back to the full 32-bytes
  //   */
  //   if (!legacy && S.length < 32) {
  //     let pad = Buffer.alloc(32 - S.length).fill(0);
  //     S = Buffer.concat([pad, S]);
  //   }
  //
  //   // SHA512 used in ECIES
  //   return sha512(S);
  // }
  //
  // /** @throws {Error} - overflow of the key could not be derived */
  // child(offset) {
  //   offset = Buffer.concat([this.toPublicKey().toBuffer(), offset]);
  //   offset = sha256(offset);
  //   let c = BigInteger.fromBuffer(offset);
  //
  //   if (c.compareTo(n) >= 0)
  //     throw new Error("Child offset went out of bounds, try again");
  //
  //   let derived = this.d.add(c); //.mod(n)
  //
  //   if (derived.signum() === 0)
  //     throw new Error(
  //       "Child offset derived to an invalid key, try again"
  //     );
  //
  //   return new PrivateKey(derived);
  // }
  //
  // static fromHex(hex) {
  //   return PrivateKey.fromBuffer(new Buffer(hex, "hex"));
  // }
  //
  // toHex() {
  //   return this.toBuffer().toString("hex");
  // }

  /* </helper_functions> */
}

export default _privatekey;

// let toPublic = data =>
//   data == null ? data : data.Q ? data : PublicKey.fromStringOrThrow(data);

