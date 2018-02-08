const Frisbee = require('frisbee');
const Debug = require('debug');
const urlJoin = require('url-join');
const dotProp = require('dot-prop');
const { merge } = require('lodash');
const { validate } = require('../helpers');
const Series = require('./series');

const NOT_IMPLEMENTED = new Error('Method not implemented yet.');
const debug = new Debug('medusa');

class Medusa {
    constructor(opts = {}) {
        const defaults = {
            url: 'http://localhost:8081/',
            apiKey: undefined,
            token: undefined
        };

        if (opts.url && opts.url.length === 0) {
            throw new Error('Url parameter must be specified as a string.');
        }

        merge(this, defaults, opts);

        const baseURI = this.url.endsWith('api/v2') ? this.url : urlJoin(this.url, 'api/v2');
        debug(`Using ${baseURI} for API.`);

        this._api = new Frisbee({
            baseURI,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (this.token) {
            this.auth({ token: this.token });
        }

        if (this.apiKey) {
            this.auth({ apiKey: this.apiKey });
        }
    }

    static generateIdentifier(media) {
        // @TODO: showType should be changed to mediaType or just type
        if (media.showType === 'series') {
            if ('tvdb' in media.id) {
                return `tvdb${media.id.tvdb}`;
            }
        }
    }

    auth({ apiKey, token, username, password }) {
        const api = this._api;

        return new Promise(async (resolve, reject) => {
            if ([apiKey, token, username].filter(param => String(param).trim().length ? param : '').length >= 2) {
                reject(new Error('Too many auth fields passed.'));
            }

            if (token) {
                debug('Using JWT');
                api.jwt(token);
                this.token = token;
                return resolve();
            }

            if (apiKey) {
                debug('Using apiKey');
                api.headers['X-Api-Key'] = apiKey;
                this.apiKey = apiKey;
                return resolve();
            }

            if (username && password) {
                debug('Using username + password');
                const res = await api.post('authenticate', { body: { username, password } });

                // Handle HTTP or API errors
                if (res.err) {
                    debug(res.err);
                    return reject(res.err);
                }

                // Set basic auth headers for all future API requests we make
                api.jwt(res.body.token);
                this.token = res.body.token;
                return resolve();
            }

            reject(new Error('Either the "apiKey", "token" or "username" and "password" params are needed.'));
        });
    }

    account() {
        return NOT_IMPLEMENTED;
    }

    series(seriesId, opts = {}) {
        // If we get 2 we patch
        if (arguments.length === 2) {
            // @TODO: Remove this hack when we fix it in Medusa's API
            if (dotProp.get(opts, 'config.paused')) {
                opts.pause = opts.config.paused;
                delete opts.config.paused;
            }

            debug('Patching %s with %O', seriesId, opts);
            return this._api.patch(`series/${seriesId}`, { body: opts }).then(data => data.body);
        }

        if (seriesId) {
            // If seriesId is string then get series
            if (typeof seriesId === 'string') {
                debug('Getting %s', seriesId);
                return this._api.get(`series/${seriesId}`).then(data => new Series(data.body));
            }

            // If seriesId is opts then paginate the listing of all series
            if (typeof seriesId === 'object') {
                debug('Getting all series with opts %O', seriesId);
                const { page, limit, sort } = seriesId;

                validate.typeof([page, limit, sort], ['string', 'integer']);

                return this._api.get(`series/${seriesId}?page=${page}&limit=${limit}`).then(data => data.body.map(series => new Series(series)));
            }
        }

        return this._api.get('series').then(data => data.body.map(series => new Series(series)));
    }

    episode() {
        return NOT_IMPLEMENTED;
    }

    config(opts = {}) {
        if (arguments.length >= 1) {
            return this._api.patch('config/main', { body: opts }).then(data => data.body);
        }

        return this._api.get('config').then(data => data.body[0]);
    }
}

module.exports = Medusa;
