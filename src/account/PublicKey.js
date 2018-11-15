import {Point, getCurveByName} from "ecurve";

const secp256k1 = getCurveByName("secp256k1");
import {encode} from "./crypto/base58";

var hash = require('hash.js');
const Buffer = require('buffer/').Buffer;

class PublicKey {
  /** @param {Point} public key */
  constructor(Q) {
    this.Q = Q;
  }


  static fromBuffer(buffer) {
    if (
      buffer.toString("hex") ===
      "000000000000000000000000000000000000000000000000000000000000000000"
    )
      return new PublicKey(null);
    return new PublicKey(Point.decodeFrom(secp256k1, buffer));
  }

  toBuffer(compressed = this.Q ? this.Q.compressed : null) {
    if (this.Q === null)
      return Buffer.from(
        "000000000000000000000000000000000000000000000000000000000000000000",
        "hex"
      );
    return this.Q.getEncoded(compressed);
  }

  static fromPoint(point) {
    return new PublicKey(point);
  }

  toUncompressed() {
    let buf = this.Q.getEncoded(false);
    let point = Point.decodeFrom(secp256k1, buf);
    return PublicKey.fromPoint(point);
  }

  /** Alias for {@link toPublicKeyString} */
  toString(address_prefix = 'BTS') {
    return this.toPublicKeyString(address_prefix);
  }


  toPublicKeyString(address_prefix = 'BTS') {
    let pub_buf = Buffer.from(this.toBuffer(), 'hex');
    let checksum = Buffer.from(hash.ripemd160().update(pub_buf).digest())
    let addy = Buffer.concat([pub_buf, checksum.slice(0, 4)]);
    return address_prefix + encode(addy.toString('hex'));
  }

  /**
   @arg {string} public_key - like GPHXyz...
   @arg {string} address_prefix - like GPH
   @return PublicKey or `null` (if the public_key string is invalid)
   */
  static fromPublicKeyString(
    public_key,
    address_prefix = 'BTS'
  ) {
    try {
      return PublicKey.fromStringOrThrow(public_key, address_prefix);
    } catch (e) {
      return null;
    }
  }

  static fromHex(hex) {
    return PublicKey.fromBuffer(Buffer.from(hex, "hex"));
  }

  toHex() {
    return this.toBuffer().toString("hex");
  }

  static fromPublicKeyStringHex(hex) {
    return PublicKey.fromPublicKeyString(Buffer.from(hex, "hex"));
  }
}

export default PublicKey;
