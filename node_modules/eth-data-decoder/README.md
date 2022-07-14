# Ethereum Data Decoder (TypeScript)

The library can be used to decode contract transactions data. The library uses TypeScript to provide type information for the decoded data, this helps it self document and make it easier for you to use the library.

## Installation

Using NPM

```bash
npm install eth-data-decoder
```

using Yarn

```bash
yarn add eth-data-decoder
```

## Example

```js
import { parseContractABI, decodeTransactionDataProcessor } from 'eth-data-decoder';

const contractABI = parseContractABI(contractABIString);
const decoder = decodeTransactionDataProcessor(contractABI);

// ...
// ...
// ...

// Decode the transaction input
const decodedData = decoder(transaction.input);

// Get the name of the function called
console.log(`Function name: ${decodedData.functionABI.name})`);

// Get the list of the param names and its values
decodedData.params.map(
    param =>
        console.log(`Name: ${param.abi.name}, Value: ${param.rawValue}));
```

## License

[MIT](https://github.com/zabirauf/eth-data-decoder/blob/master/LICENSE) © 2019 Zohaib Rauf.
