const test = require('ava');
const { Medusa, Series } = require('../src');

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

test('add series using tvdb', async t => {
    const { medusa, username, password } = t.context;
    await medusa.auth({ username, password });

    // Create series
    const mayonnaiseSeries = new Series({ indexer: 'tvdb', id: '334387' });

    // Send request to Medusa to save
    const series = await mayonnaiseSeries.save();

    // Get series id
    const identifier = Medusa.generateIdentifier(series);

    // Check if series was added
    t.is(await medusa.series(identifier).then(series => series.seasons.length), 1);
});
