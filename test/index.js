const test = require('ava');
const Medusa = require('..');
const fixtures = require('./fixtures');

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

test('returns self', t => {
    const { medusa } = t.context;
    t.true(medusa instanceof Medusa);
});

test('generateIdentifier returns valid identifier', t => {
    const identifier = Medusa.generateIdentifier({
        showType: 'series',
        id: {
            tvdb: '83462'
        }
    });

    t.is(identifier, 'tvdb83462');
});

test('authenticate accepts username + password', async t => {
    const { medusa, username, password } = t.context;
    t.notThrows(async () => {
        await medusa.auth({ username, password });
    });
});

test('authenticate accepts apiKey', async t => {
    const { medusa, apiKey } = t.context;
    t.notThrows(async () => {
        await medusa.auth({ apiKey });
    });
});

test('authenticate throws error with multiple auth params used', async t => {
    const { medusa, apiKey, username, password } = t.context;
    const error = await t.throws(medusa.auth({ apiKey, username, password }));
    t.is(error.message, 'Too many auth fields passed.');
});

test('authenticate throws error with no params used', async t => {
    const { medusa } = t.context;
    const error = await t.throws(medusa.auth({}));
    t.is(error.message, 'Either the "apiKey", "token" or "username" and "password" params are needed.');
});

test('config', async t => {
    const { medusa, username, password } = t.context;
    await medusa.auth({ username, password });

    // Set torrents.enabled = true
    await medusa.config({ torrents: { enabled: true } });
    t.is(await medusa.config().then(({ torrents }) => torrents.enabled), true);

    // Set torrents.enabled = false
    await medusa.config({ torrents: { enabled: false } });
    t.is(await medusa.config().then(({ torrents }) => torrents.enabled), false);
});

test('returns all series', async t => {
    const { medusa, username, password } = t.context;
    await medusa.auth({ username, password });

    // Get all series
    t.is(await medusa.series().then(allSeries => allSeries.length), 1);

    // Get first series
    t.is(await medusa.series().then(([series]) => series.title), fixtures.series[0].title);
});

test.failing('set series to paused', async t => {
    const { medusa, username, password } = t.context;
    await medusa.auth({ username, password });

    // Get series
    const castleSeries = await medusa.series().then(([series]) => series);

    // Get first series
    const identifier = Medusa.generateIdentifier(castleSeries);

    // Set paused = true
    t.is(await medusa.series(identifier, { config: { paused: true } }), {});
    t.is(await medusa.series(identifier).then(series => series.config.paused), true);

    // Set paused = false
    await medusa.series(identifier, { config: { paused: false } });
    t.is(await medusa.series(identifier).then(series => series.config.paused), false);
});
