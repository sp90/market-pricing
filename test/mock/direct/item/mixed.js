import 'app-module-path/cwd';

import test from 'ava';
import nock from 'nock';

import {
    getPrices,
    Currency,
    Application,
} from 'lib';

import {
    base,
    path,
} from 'test/settings';

nock(base)

// Non-Existent Item With Status Code 500
.get(path)
.query({
    appid: Application.CSGO,
    currency: Currency.USD,
    market_hash_name: 'DoesNotExist500',
})
.reply(500, {success: false})
// Non-Existent Item With Status Code 404
.get(path)
.query({
    appid: Application.CSGO,
    currency: Currency.USD,
    market_hash_name: 'DoesNotExist404',
})
.reply(404, {success: false})

// First Valid Item Request
.get(path)
.query({
    appid: Application.CSGO,
    currency: Currency.USD,
    market_hash_name: 'FirstItem',
})
.reply(200, {
    success: true,
    lowest_price: '$1.00',
    volume: '328',
    median_price: '$1.30',
})

// Second Valid Item Request
.get(path)
.query({
    appid: Application.CSGO,
    currency: Currency.USD,
    market_hash_name: 'SecondItem',
})
.reply(200, {
    success: true,
    lowest_price: '$2.00',
    volume: '612',
    median_price: '$1.70',
});

test('Multiple Mixed Items That Do And Do Not Exist', async (t) => {
    const item = await getPrices(
        [
            'DoesNotExist500',
            'DoesNotExist404',
            'FirstItem',
            'SecondItem',
        ],
        { id: Application.CSGO, currency: Currency.USD },
    );
    const should = {
        errors: [
            {
                error: 'Item Not Found! Status: 500',
                id: 'DoesNotExist500',
            },
            {
                error: 'Item Not Found! Status: 404',
                id: 'DoesNotExist404',
            },
        ],
        results: [
            {
                id: 'FirstItem',
                price: {
                    type: 'us-dollar',
                    code: 'USD',
                    sign: '$',
                    lowest: 1,
                    median: 1.3,
                },
                volume: 328,
            },
            {
                id: 'SecondItem',
                price: {
                    type: 'us-dollar',
                    code: 'USD',
                    sign: '$',
                    lowest: 2,
                    median: 1.7,
                },
                volume: 612,
            },
        ],
    };
    t.deepEqual(item, should);
});
