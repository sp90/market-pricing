import 'app-module-path/cwd';

import test from 'ava';
import nock from 'nock';

import {
    Currency,
    Application,
} from '@node-steam/data';

import {
    Market,
    error,
} from 'lib';

import {
    base,
    path,
} from 'test/settings';

nock(base)

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
})

// First Valid Item Request
.get(path)
.query({
    appid: Application.CSGO,
    currency: Currency.USD,
    market_hash_name: 'FirstEmptyItem',
})
.reply(200, {
    success: true,
})

// Second Valid Item Request
.get(path)
.query({
    appid: Application.CSGO,
    currency: Currency.USD,
    market_hash_name: 'SecondEmptyItem',
})
.reply(200, {
    success: true,
});

const API = new Market({ id: Application.CSGO, currency: Currency.USD });

test('Multiple Mixed Items That Are Empty And Are Not Empty', async (t) => {
    const item = await API.getPrices([
        'FirstEmptyItem',
        'SecondEmptyItem',
        'FirstItem',
        'SecondItem',
    ]);
    const should = {
        errors: [
            {
                code: 'ITEM_NO_DATA',
                error: 'Item Was Found But No Data Transmitted!',
                id: 'FirstEmptyItem',
            },
            {
                code: 'ITEM_NO_DATA',
                error: 'Item Was Found But No Data Transmitted!',
                id: 'SecondEmptyItem',
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
