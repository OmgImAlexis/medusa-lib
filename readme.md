# medusa-lib [![Build Status](https://travis-ci.org/OmgImAlexis/medusa-lib.svg?branch=master)](https://travis-ci.org/OmgImAlexis/medusa-lib) [![codecov](https://codecov.io/gh/OmgImAlexis/medusa-lib/badge.svg?branch=master)](https://codecov.io/gh/OmgImAlexis/medusa-lib?branch=master)

> Medusa API Wrapper


## Install

```
$ yarn add medusa-lib
```


## Usage

```js
const Medusa = require('medusa-lib');

const medusa = new Medusa({
    url: 'http://localhost:8081/'
});

// Authentication will last as long as the JWT expiry
// By default Medusa ships with a 24 hour expiry
medusa.auth({username: 'OmgImAlexis', password: 'SuperStrongPassword!'});

medusa.config({
    torrents: {
        enabled: false
    }
}).then(config => console.log(config));
// { torrents: { enabled: false } }

medusa.config().then(config => console.log(config.torrents.enabled))
// { torrents: { enabled: false } }
```

## License

MIT © [Alexis Tyler](https://wvvw.me)
