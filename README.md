# Bitshares Login API

## Setup

This library can be obtained through npm:
```
npm install bitshares-login
```

Works fine with React-Native. Most crypto libraries was ported and works fine with RN

## Usage

### Import 

```
import {BitShares} from 'bitshares-login';

```

### Setup defaults

```
BitShares.init("https://openledger.io", "refcode", "referrer");

```

### Get Account
```
BitSharesApi.connect("wss://bitshares.openledger.info/ws").then(() => {
      return BitSharesApi.api().account.getAccount("username").then(acc => {
        console.log(acc)
        BitSharesApi.close();
      }).catch(e => {
        throw ...
      })
    }).catch(e => console.log(e));
```

#### Register new Account
```
BitSharesApi.connect("wss://bitshares.openledger.info/ws").then(() => {
      return BitSharesApi.api().account.create("username", "password").then(acc => {
        console.log(acc)
        BitSharesApi.close();
      }).catch(e => {
        throw ...
      })
    }).catch(e => console.log(e));
```

#### Login
```
BitSharesApi.connect("wss://bitshares.openledger.info/ws").then(() => {
      return BitSharesApi.api().account.login("username", "password").then(acc => {
        console.log(acc)
        BitSharesApi.close();
      }).catch(e => {
        throw ...
      })
    }).catch(e => console.log(e));
```


