var hash = require('hash.js');

/** @arg {string|Buffer} data
 @arg {string} [digest = null] - 'hex', 'binary' or 'base64'
 @return {string|Buffer} - Buffer when digest is null, or string
 */
function sha256(data, encoding) {
  return hash.sha256()
    .update(data)
    .digest(encoding);
}

export {sha256};
