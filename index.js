const Frisbee = require('frisbee');
const Debug = require('debug');
const { URL } = require('whatwg-url');

const NOT_IMPLEMENTED = new Error('Method not implemented yet.');
const debug = new Debug('medusa');

const validate = {
    typeof: (inputs, opts) => {
        inputs = Array.isArray(inputs) ? inputs : [inputs];
        opts = Array.isArray(opts) ? opts : [opts];

        inputs.forEach(input => {
            if (!opts.includes(typeof input)) {
                throw new Error(`"${input}" must be a string or integer`);
            }
        });
    }
};

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
                    response.body = { token: response.body };
                }
                return response;
            }
        });
    }

    account() {
        return NOT_IMPLEMENTED;
    }

    series(seriesId, opts = {}) {
        if (arguments.length >= 2) {
            return this._api.patch(`/series/${seriesId}`, { body: { ...opts } }).then(data => data.body);
        }

        if (seriesId) {
            // If seriesId is string then get series
            if (typeof seriesId === 'string') {
                return this._api.get(`/series/${seriesId}`).then(data => data.body);
            }

            // If seriesId is opts
            if (typeof seriesId === 'object') {
                const { page, limit, sort } = seriesId;

                validate.typeof([page, limit, sort], ['string', 'integer']);

                return this._api.get(`/series/${seriesId}?page=${page}&limit=${limit}`).then(data => data.body);
            }
        }

        return this._api.get('/series').then(data => data.body);
    }

    episode() {
        return NOT_IMPLEMENTED;
    }

    config(opts = {}) {
        if (arguments.length >= 1) {
            return this._api.patch('/config/main', { body: opts }).then(data => data.body);
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
