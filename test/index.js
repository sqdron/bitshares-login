import {assert} from 'chai';
import {Crypto} from "../src/account/crypto";
import {BitSharesApi} from "../src/account/api";

require('isomorphic-fetch');

describe('Test Crypto', () => {
  it('should test key generations from password', () => {
    let key = Crypto.KeyFromPassword("username1", "owner", "password1");
    assert(key !== undefined);
    assert(key.privKey != null);
    console.log("test res");
  });
});

// describe('Test Get Account By Name', () => {
//   it('should test get account by name', () => {
//     // BitSharesApi()
//     BitSharesApi.connect("wss://bitshares.openledger.info/ws").then(() => {
//       console.log(BitSharesApi.api().account)
//       return BitSharesApi.api().account.getAccount("dmtestusername1").then(acc => {
//         assert(acc != null);
//         BitSharesApi.close();
//       }).catch(e => {
//         console.log(e)
//         assert(e == null);
//         BitSharesApi.close();
//       })
//     }).catch(e => console.log(e));
//     console.log("done!");
//   });
// });
//
describe('Test Login Account', () => {
  it('should test login account', () => {
    console.log("Init")
    BitSharesApi.init("https://faucet.bitshares.eu/onboarding", null, null);
    console.log("Connect")
    BitSharesApi.connect("wss://bitshares.nu/ws").then(() => {
      console.log("Crete account")
      return BitSharesApi.api().account.create("dmtestusername5", "password5").then(acc => {
        console.log(acc)
        assert(acc != null);
        BitSharesApi.close();
      }).catch(e => {
        console.log(e)
        assert(e == null);
      })
    }).catch(e => console.log(e));
    console.log("done!");
  });
});
