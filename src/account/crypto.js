import privateKey from "./privatekey";

const generateKeyFromPassword = (accountName, role, password) => {
  let seed = accountName + role + password;
  let privKey = privateKey.fromSeed(seed);
  let pubKey = privKey.toPublicKey().toPublicKeyString("BTS");

  console.log(pubKey)
  return {privKey, pubKey};
};

export const Crypto = {
  KeyFromPassword: generateKeyFromPassword,
};

