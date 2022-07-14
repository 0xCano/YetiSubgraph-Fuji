const CryptoJS = require('crypto-js');
const sha3 = require('crypto-js/sha3');

export function keccak256(
    value: string,
    options?: { encoding: 'hex' }
): string {
    if (options && options.encoding === 'hex') {
        if (value.length > 2 && value.substr(0, 2) === '0x') {
            value = value.substr(2);
        }
        value = CryptoJS.enc.Hex.parse(value);
    }

    return sha3(value, {
        outputLength: 256,
    }).toString();
}
