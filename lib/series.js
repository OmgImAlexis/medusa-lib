const { assignIn } = require('lodash');

class Series {
    constructor(opts = {}) {
        const defaults = {
            status: undefined,
            rating: undefined,
            genres: undefined,
            showType: undefined,
            network: undefined,
            language: undefined,
            title: undefined,
            akas: undefined,
            classification: undefined,
            plot: undefined,
            indexer: undefined,
            countries: undefined,
            cache: undefined,
            airs: undefined,
            year: undefined,
            config: {
                qualities: {
                    preferred: [],
                    allowed: []
                },
                defaultEpisodeStatus: undefined,
                dvdOrder: undefined,
                flattenFolders: undefined,
                scene: undefined,
                paused: undefined,
                location: undefined,
                airByDate: undefined,
                release: {
                    blacklist: [],
                    ignoredWords: [],
                    whitelist: [],
                    requiredWords: []
                },
                subtitlesEnabled: undefined,
                aliases: []
            },
            // eslint-disable-next-line camelcase
            country_codes: undefined,
            runtime: undefined,
            type: undefined,
            id: {
                tvdb: undefined,
                imdb: undefined
            }
        };

        assignIn(this, defaults, opts);
    }

    validate() {
        return new Series(this);
    }
}

module.exports = Series;
