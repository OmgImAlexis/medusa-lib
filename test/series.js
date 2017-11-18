const test = require('ava');
const { Medusa, Series } = require('..');

test.beforeEach(t => {
    t.context = {
        medusa: new Medusa({
            url: 'http://localhost:8081/redapples/'
        }),
        username: 'username',
        password: 'password',
        apiKey: '2d989cb6697ec45bfe2d217a1e09c034'
    };
});

test.failing('add series using tvdb', async t => {
    const { medusa, username, password } = t.context;
    await medusa.auth({ username, password });

    // Create series
    const castleSeries = new Series({ indexer: 'tvdb', id: '83462' });

    // Get series id
    const identifier = Medusa.generateIdentifier(castleSeries);
    t.is(await medusa.series(identifier).then(series => series.status), 'Unknown');

    // Since we don't want to wait for the background process
    // let's just force the update to happen now
    castleSeries.update();

    t.is(await medusa.series(identifier).then(series => series.status), 'Ended');
});
