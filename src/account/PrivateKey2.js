import {Point, getCurveByName} from "ecurve";
import BigInteger from "bigi";
import {sha256, sha512} from "./hash";
import PublicKey from "./PublicKey";
import deepEqual from "deep-equal";
import assert from "assert";

const secp256k1 = getCurveByName("secp256k1");
const {n} = secp256k1;
const Buffer = require("safe-buffer").Buffer;

class PrivateKey2 {
  /**
   @private see static functions
   @param {BigInteger}
   */
  constructor(d) {
    this.d = d;
  }

  static fromBuffer(buf) {
    if (!Buffer.isBuffer(buf)) {
      throw new Error("Expecting paramter to be a Buffer type");
    }
    if (32 !== buf.length) {
      console.log(
        `WARN: Expecting 32 bytes, instead got ${
          buf.length
          }, stack trace:`,
        new Error().stack
      );
    }
    if (buf.length === 0) {
      throw new Error("Empty buffer");
    }
    return new PrivateKey2(BigInteger.fromBuffer(buf));
  }

  /** @arg {string} seed - any length string.  This is private, the same seed produces the same private key every time.  */
  static fromSeed(seed) {
    // generate_private_key
    if (!(typeof seed === "string")) {
      throw new Error("seed must be of type string");
    }
    return PrivateKey2.fromBuffer(sha256(seed));
  }

  /** @return {string} Wallet Import Format (still a secret, Not encrypted) */
  static fromWif(_private_wif) {
    var private_wif = Buffer.from(decode(_private_wif));
    var version = private_wif.readUInt8(0);
    assert.equal(
      0x80,
      version,
      `Expected version ${0x80}, instead got ${version}`
    );
    // checksum includes the version
    var private_key = private_wif.slice(0, -4);
    var checksum = private_wif.slice(-4);
    var new_checksum = sha256(private_key);
    new_checksum = sha256(new_checksum);
    new_checksum = new_checksum.slice(0, 4);
    var isEqual = deepEqual(checksum, new_checksum); //, 'Invalid checksum'
    if (!isEqual) {
      throw new Error("Checksum did not match");
    }
    private_key = private_key.slice(1);
    return PrivateKey2.fromBuffer(private_key);
  }

  toWif() {
    var private_key = this.toBuffer();
    // checksum includes the version
    private_key = Buffer.concat([Buffer.from([0x80]), private_key]);
    var checksum = sha256(private_key);
    checksum = sha256(checksum);
    checksum = checksum.slice(0, 4);
    var private_wif = Buffer.concat([private_key, checksum]);
    return encode(private_wif);
  }

  /**
   @return {Point}
   */
  toPublicKeyPoint() {
    return secp256k1.G.multiply(this.d);
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

  toByteBuffer() {
    var b = new ByteBuffer(
      ByteBuffer.DEFAULT_CAPACITY,
      ByteBuffer.LITTLE_ENDIAN
    );
    this.appendByteBuffer(b);
    return b.copy(0, b.offset);
  }

  static fromHex(hex) {
    return PrivateKey2.fromBuffer(new Buffer(hex, "hex"));
  }

  toHex() {
    return this.toBuffer().toString("hex");
  }

  /* </helper_functions> */
}

export default PrivateKey2;
