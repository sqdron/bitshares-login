import {Crypto} from "../utils/crypto";
import {Settings} from "../settings";
import {BitSharesApi} from "../api/bitshares";

require('isomorphic-fetch');

export const AccountService = {
  getAccount: async (name) => {
    let acc = await BitSharesApi.api().DB.AccountByName(name).catch(err => console.log(err));
    if (!acc || acc.name !== name) {
      throw new Error(`Not found account ${name}! Blockchain return ${acc ? acc.name : acc}`);
    }
    return acc;
  },

  login: async (name, password) => {
    let acc = await BitSharesApi.api().DB.AccountByName(name).catch(err => console.log(err));
    let {privKey: activePrivate, pubKey: activePub} = Crypto.KeyFromPassword(name, "active", password);
    if (activePub !== acc.active.key_auths[0][0]) {
      throw new Error("The pair of login and password do not match!")
    }

    return {
      owner: Crypto.KeyFromPassword(name, "owner", password),
      active: Crypto.KeyFromPassword(name, "active", password),
      memo: Crypto.KeyFromPassword(name, "memo", password)
    }
  },

  create: async (name, password) => {
    let {pubKey: ownerPub} = Crypto.KeyFromPassword(name, "owner", password);
    let {pubKey: activePub} = Crypto.KeyFromPassword(name, "active", password);
    let {pubKey: memoPub} = Crypto.KeyFromPassword(name, "memo", password);
    console.log("owner", ownerPub);
    console.log("active", activePub);
    console.log("memo", memoPub);

    let faucetAddress = Settings.Faucet();
    console.log("Settings.Faucet", Settings.Faucet());
    return await fetch(
      faucetAddress + "/api/v1/accounts",
      {
        method: "post",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          account: {
            name: name,
            owner_key: ownerPub,
            active_key: activePub,
            memo_key: memoPub,
            refcode: Settings.Refcode,
            referrer: Settings.Referrer,
          },
        }),
      },
    ).then(r => r.json());
  },
};
