const test = require('ava');
const Medusa = require('.');

test.beforeEach(t => {
    t.context = {
        medusa: new Medusa({
            url: 'http://localhost:8081/redapples/'
        }),
        username: 'username',
        password: 'password'
    };
});

test('returns self', t => {
    const { medusa } = t.context;
    t.true(medusa instanceof Medusa);
});

test('authenticate', async t => {
    const { medusa, username, password } = t.context;
    t.notThrows(async () => {
        await medusa.auth({ username, password });
    });
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
