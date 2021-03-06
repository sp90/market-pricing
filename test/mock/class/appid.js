import 'app-module-path/cwd';

import test from 'ava';

import {
    Market,
} from 'lib';

test('Invalid Application ID', (t) => {
    const market = t.throws(() => {
        return new Market({ id: '730' });
    });
    t.deepEqual(market.message, 'Invalid Application ID!');
});
