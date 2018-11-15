import createHash from "create-hash";
var hash = require('hash.js');

/** @arg {string|Buffer} data
 @arg {string} [digest = null] - 'hex', 'binary' or 'base64'
 @return {string|Buffer} - Buffer when digest is null, or string
 */
function sha256(data, encoding) {
  return createHash("sha256")
    .update(data)
    .digest(encoding);
}

function ripemd160(data) {
  return createHash("rmd160")
    .update(data)
    .digest();
}



export {sha256, ripemd160};
