const Frisbee = require('frisbee');
const Debug = require('debug');
const { URL } = require('whatwg-url');

const NOT_IMPLEMENTED = new Error('Method not implemented yet.');
const debug = new Debug('medusa');

class Medusa {
    constructor(opts = {}) {
        if (opts.url.length === 0) {
            throw new Error('Url parameter must be specified as a string.');
        }

        this.apiKey = opts.apiKey || null;

        this._api = new Frisbee({
            baseURI: new URL('/api/v2', opts.url),
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });

        this._api.interceptor.register({
            response: response => {
                if (typeof response.body === 'string' && response.url.endsWith('/authenticate')) {
                    // eslint-disable-next-line camelcase
                    response.body = { token: response.body };
                }
                return response;
            }
        });
    }

    account() {
        return NOT_IMPLEMENTED;
    }

    series() {
        return NOT_IMPLEMENTED;
    }

    episode() {
        return NOT_IMPLEMENTED;
    }

    config(opts = {}) {
        if (arguments.length >= 1) {
            return this._api.patch('/config/main', { body: { ...opts } }).then(data => data.body);
        }

        return this._api.get('/config').then(data => data.body[0]);
    }

    auth({ apiKey, token, username, password }) {
        const api = this._api;

        return new Promise(async (resolve, reject) => {
            if (token) {
                debug('Using JWT');
                api.jwt(token);
                return resolve();
            }

            if (apiKey) {
                debug('Using apiKey');
                api.headers['X-Api-Key'] = apiKey;
                return resolve();
            }

            if (username && password) {
                debug('Using username + password');
                const res = await api.post('/authenticate', { body: { username, password } });

                // Handle HTTP or API errors
                if (res.err) {
                    debug(res.err);
                    return reject(res.err);
                }

                // Set basic auth headers for all future API requests we make
                api.jwt(res.body.token);
                return resolve();
            }
        });
    }
}

module.exports = Medusa;
