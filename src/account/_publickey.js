// import {encode, decode} from "./crypto/base58";
//
// const Buffer = require('buffer/').Buffer;
// var hash = require('hash.js');
//
// class ___publickey {
//   constructor(Q) {
//     this.Q = Q;
//   }
//
//   static fromPoint(point) {
//     return new ___publickey(point);
//   }
//
//   toBuffer(compressed = this.Q ? this.Q.compressed : null) {
//     console.log("bbb")
//     if (this.Q === null)
//       return Buffer.from(
//         "000000000000000000000000000000000000000000000000000000000000000000",
//         "hex"
//       );
//     console.log("get encoded", compressed)
//     return this.Q.getEncoded(compressed);
//   }
//
//   /** Alias for {@link toPublicKeyString} */
//   toString(address_prefix = 'BTS') {
//     return this.toPublicKeyString(address_prefix);
//   }
//
//   /**
//    Full public key
//    {return} string
//    */
//   toPublicKeyString(address_prefix = 'BTS') {
//     let pub_buf = this.toBuffer();
//     let checksum = hash.ripemd160().update(pub_buf).digest('hex');
//     console.log("s", encode(pub_buf + checksum.substr(0, 8)));
//     return address_prefix + encode(pub_buf + checksum.substr(0, 8));
//   }
//
//   /* </HEX> */
// }
//
// export default ___publickey;
