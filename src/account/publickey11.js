import {encode, decode} from "./crypto/base58";
import {Point} from "ecurve";
import {getCurveByName} from "./crypto/ecurve";

const Buffer = require('buffer/').Buffer;
var hash = require('hash.js');
const secp256k1 = getCurveByName("secp256k1");

class Publickey11 {
  constructor(Q) {
    this.Q = Q;
  }

  static fromPoint(point) {
    return new Publickey11(point);
  }

  static fromBuffer(buffer) {
    if (
      buffer.toString("hex") ===
      "000000000000000000000000000000000000000000000000000000000000000000"
    )
      return new Publickey11(null);
    return new Publickey11(Point.decodeFrom(secp256k1, buffer));
  }

  toBuffer(compressed = this.Q ? this.Q.compressed : null) {
    console.log("bbb")
    if (this.Q === null)
      return Buffer.from(
        "000000000000000000000000000000000000000000000000000000000000000000",
        "hex"
      );
    console.log("get encoded", compressed)
    return this.Q.getEncoded(compressed);
  }

  static fromPoint(point) {
    return new Publickey11(point);
  }

  toUncompressed() {
    let buf = this.Q.getEncoded(false);
    let point = Point.decodeFrom(secp256k1, buf);
    return p.fromPoint(point);
  }


  /** Alias for {@link toPublicKeyString} */
  toString(address_prefix = 'BTS') {
    return this.toPublicKeyString(address_prefix);
  }

  /**
   Full public key
   {return} string
   */
  toPublicKeyString(address_prefix = 'BTS') {
    let pub_buf = this.toBuffer();
    let checksum = hash.ripemd160().update(pub_buf).digest('hex');
    console.log("s", encode(pub_buf + checksum.substr(0, 8)));
    return address_prefix + encode(pub_buf + checksum.substr(0, 8));
  }

  static fromHex(hex) {
    return Publickey11.fromBuffer(Buffer.from(hex, "hex"));
  }

  toHex() {
    return this.toBuffer().toString("hex");
  }

  /* </HEX> */
}

export default Publickey11;
