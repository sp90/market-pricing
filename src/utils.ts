/**
 * npm dependencies
 */
import * as enums from '@node-steam/data';

/**
 * project dependencies
 */
import {
    codes as code,
    Exception,
} from './error';

/**
 * Determines the type of a variable.
 * Useful for e.g. checking if a object is an error
 * @hidden
 */
export const type = (variable: any):
'boolean'  |
'date'     |
'error'    |
'function' |
'json'     |
'math'     |
'number'   |
'object'   |
'string'   |
'symbol' => {
    return ({}).toString.call(variable).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
};

/**
 * Clean the currency string we get from the Steam API into a integer
 * @hidden
 */
const unformat = (value: string): number | Error => {
    if (type(value) !== 'string') return new TypeError(`Supplied value isn't a string!`);

    const x = parseInt(('' + value)
    .replace(/\((?=\d+)(.*)\)/, '-$1')
    .replace(',--', '00')
    .replace(/[^0-9-]/g, ''), 10 ) / 100;

    if (isNaN(x) || x <= 0) {
        return new Error(`Something went wrong when trying to parse the value: ${value}`);
    }

    return x;
};

/**
 * Determine currency code by Steam currency ID
 * @hidden
 */
const determineCurrencyCode = (currency: number): string => {
    return enums.Currency[currency];
};

/**
 * Determine currency type by Steam currency ID
 * @hidden
 */
const determineCurrencyType = (currency: number): string => {
    return enums.CurrencyType[enums.Currency[currency] as any];
};

/**
 * Determine currency sign by Steam currency ID
 * @hidden
 */
const determineCurrencySign = (currency: number): string => {
    return enums.CurrencySign[enums.Currency[currency] as any];
};

/**
 * Generates the cleaned price item
 * @hidden
 */
export const generateItem = (name: string, response: NodeSteamRawItem, currency: number): NodeSteamCleanItem | Error => {
    const result: NodeSteamCleanItem = {
        id: name,
        price: {
            code: determineCurrencyCode(currency),
            sign: determineCurrencySign(currency),
            type: determineCurrencyType(currency),
        },
    };

    if (response.lowest_price) {
        const lowest = unformat(response.lowest_price);

        if (type(lowest) === 'error') return lowest as Error;

        result.price.lowest = lowest as number;
    }

    if (response.median_price) {
        const median = unformat(response.median_price);

        if (type(median) === 'error') return median as Error;

        result.price.median = median as number;
    }

    if (response.volume) {
        result.volume = parseInt(response.volume, 10);
    }

    if (response.timings) {
        result.timings = response.timings;
    }

    if (!result.price.lowest && !result.price.median) return new Exception(code.ITEM_NO_DATA);

    return result;
};
