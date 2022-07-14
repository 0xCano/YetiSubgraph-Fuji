import {
    decodeTransactionDataProcessor,
    ValueType,
    AddressParamInfo,
    NumberParamInfo,
    ArrayParamInfo,
    BytesParamInfo,
} from '../../lib/decoder/decodeTransactionData';
import {
    ContractABI,
    ABIFunctionDescription,
    ABIConstructorDescription,
} from '../../lib/types/ABI';

const TRANSFORM_FUNCTION_ABI = Object.freeze<ABIFunctionDescription>({
    constant: false,
    inputs: [
        {
            name: '_to',
            type: 'address',
        },
        {
            name: '_value',
            type: 'uint256',
        },
    ],
    name: 'transfer',
    outputs: [
        {
            name: '',
            type: 'bool',
        },
    ],
    payable: false,
    type: 'function',
});

const FUNCTION_WITH_STATIC_ARRAY_ABI = Object.freeze<ABIFunctionDescription>({
    constant: false,
    inputs: [
        {
            name: '_value',
            type: 'bytes3[2]',
        },
    ],
    name: 'bar',
    outputs: [
        {
            name: 'r',
            type: 'bool',
        },
    ],
    payable: false,
    type: 'function',
});

const FUNCTION_WITH_DYNAMIC_ARRAY_ABI = Object.freeze<ABIFunctionDescription>({
    constant: false,
    inputs: [
        {
            name: '_num',
            type: 'uint256',
        },
        {
            name: '_value',
            type: 'bytes3[]',
        },
    ],
    name: 'baz',
    outputs: [
        {
            name: 'r',
            type: 'bool',
        },
    ],
    payable: false,
    type: 'function',
});

const FUNCTION_WITH_DYNAMIC_ARRAY_IN_BEGINNING_ABI = Object.freeze<
    ABIFunctionDescription
>({
    constant: false,
    inputs: [
        {
            name: '_value',
            type: 'bytes',
        },
        {
            name: '_num',
            type: 'uint256',
        },
    ],
    name: 'baz',
    outputs: [
        {
            name: 'r',
            type: 'bool',
        },
    ],
    payable: false,
    type: 'function',
});

// baz(uint256,uint32[],bytes10,bytes)
const FUNCTION_WITH_MIXED_TYPE_PARAMS_ABI = Object.freeze<
    ABIFunctionDescription
>({
    constant: false,
    inputs: [
        {
            name: '_param1',
            type: 'uint256',
        },
        {
            name: '_param2',
            type: 'uint32[]',
        },
        {
            name: '_param3',
            type: 'bytes10',
        },
        {
            name: '_param4',
            type: 'bytes',
        },
    ],
    name: 'baz',
    outputs: [
        {
            name: 'r',
            type: 'bool',
        },
    ],
    payable: false,
    type: 'function',
});

const CONSTRUCTOR_ABI = Object.freeze<ABIConstructorDescription>({
    inputs: [],
    payable: false,
    type: 'constructor',
});

describe('decodeTransactionData', () => {
    it('returns null when no corresponding ABI is found', () => {
        // Arrange
        const contractAbi: ContractABI = [CONSTRUCTOR_ABI];

        const data =
            '0xa9059cbb0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be00000000000000000000000000000000000000000000007332991378eb861800';

        // Act
        const result = decodeTransactionDataProcessor(contractAbi)(data);

        // Assert
        expect(result).toBeNull();
    });

    it('returns the decoded transaction data for static typed multiple params', () => {
        // Arrange
        const contractAbi: ContractABI = [
            TRANSFORM_FUNCTION_ABI,
            CONSTRUCTOR_ABI,
        ];

        const data =
            '0xa9059cbb0000000000000000000000003f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be00000000000000000000000000000000000000000000007332991378eb861800';

        // Act
        const result = decodeTransactionDataProcessor(contractAbi)(data);

        // Assert
        expect(result).not.toBeNull();

        if (result) {
            expect(result.functionABI).toEqual(TRANSFORM_FUNCTION_ABI);
            expect(result.params.length).toBe(2);
            expect(result.params[0].type).toBe(ValueType.Address);
            expect((result.params[0] as AddressParamInfo).abi).toEqual(
                TRANSFORM_FUNCTION_ABI.inputs[0]
            );
            expect(result.params[1].type).toBe(ValueType.BigNumber);
            expect((result.params[1] as NumberParamInfo).abi).toEqual(
                TRANSFORM_FUNCTION_ABI.inputs[1]
            );
        }
    });

    it('return the decoded transaction data with static array typed param', () => {
        // Arrange
        const contractAbi: ContractABI = [
            TRANSFORM_FUNCTION_ABI,
            FUNCTION_WITH_STATIC_ARRAY_ABI,
            CONSTRUCTOR_ABI,
        ];

        const data =
            '0xfce353f661626300000000000000000000000000000000000000000000000000000000006465660000000000000000000000000000000000000000000000000000000000';

        // Act
        const result = decodeTransactionDataProcessor(contractAbi)(data);

        // Assert
        expect(result).not.toBeNull();

        if (result) {
            expect(result.functionABI).toEqual(FUNCTION_WITH_STATIC_ARRAY_ABI);
            expect(result.params.length).toBe(1);
            expect(result.params[0].type).toBe(ValueType.Array);
            expect(result.params[0].rawValue).toEqual(data.slice(10));

            const arrayParamInfo = result.params[0] as ArrayParamInfo;

            expect(arrayParamInfo.value.length).toBe(2);
            expect(arrayParamInfo.value[0].type).toBe(ValueType.Bytes);
            expect(arrayParamInfo.value[0].value).toEqual('abc');
            expect(arrayParamInfo.value[1].type).toBe(ValueType.Bytes);
            expect(arrayParamInfo.value[1].value).toEqual('def');
        }
    });

    it('return the decoded transaction data with dynamic array typed param', () => {
        // Arrange
        const contractAbi: ContractABI = [
            FUNCTION_WITH_DYNAMIC_ARRAY_ABI,
            CONSTRUCTOR_ABI,
        ];

        const data =
            '0xa6479feb00000000000000000000000000000000000000000000000000000000000001230000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000261626300000000000000000000000000000000000000000000000000000000006465660000000000000000000000000000000000000000000000000000000000';

        // Act
        const result = decodeTransactionDataProcessor(contractAbi)(data);

        // Assert
        expect(result).not.toBeNull();

        if (result) {
            expect(result.functionABI).toEqual(FUNCTION_WITH_DYNAMIC_ARRAY_ABI);
            expect(result.params.length).toBe(2);
            expect(result.params[0].type).toBe(ValueType.BigNumber);
            expect(result.params[1].type).toBe(ValueType.Array);

            const arrayParamInfo = result.params[1] as ArrayParamInfo;
            expect(arrayParamInfo.value.length).toBe(2);
            expect(arrayParamInfo.value[0].type).toBe(ValueType.Bytes);
            expect(arrayParamInfo.value[0].value).toEqual('abc');
            expect(arrayParamInfo.value[1].type).toBe(ValueType.Bytes);
            expect(arrayParamInfo.value[1].value).toEqual('def');
        }
    });

    it('return the decoded transaction data with dynamic bytes array typed param', () => {
        // Arrange
        const contractAbi: ContractABI = [
            FUNCTION_WITH_DYNAMIC_ARRAY_ABI,
            FUNCTION_WITH_DYNAMIC_ARRAY_IN_BEGINNING_ABI,
            CONSTRUCTOR_ABI,
        ];

        const data =
            '0xb19c509200000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000123000000000000000000000000000000000000000000000000000000000000000d48656c6c6f2c20776f726c642100000000000000000000000000000000000000';

        // Act
        const result = decodeTransactionDataProcessor(contractAbi)(data);

        // Assert
        expect(result).not.toBeNull();

        if (result) {
            expect(result.functionABI).toEqual(
                FUNCTION_WITH_DYNAMIC_ARRAY_IN_BEGINNING_ABI
            );
            expect(result.params.length).toBe(2);
            expect(result.params[0].type).toBe(ValueType.Bytes);
            expect(result.params[1].type).toBe(ValueType.BigNumber);

            const bytesParamInfo = result.params[0] as BytesParamInfo;
            expect(bytesParamInfo.value).toEqual('Hello, world!');
        }
    });

    it('return the decoded transaction data with mixed typed params', () => {
        // Arrange
        const contractAbi: ContractABI = [
            FUNCTION_WITH_DYNAMIC_ARRAY_ABI,
            FUNCTION_WITH_MIXED_TYPE_PARAMS_ABI,
            CONSTRUCTOR_ABI,
        ];

        const data = [
            '0x2d4d0d98',
            '0000000000000000000000000000000000000000000000000000000000000123',
            '0000000000000000000000000000000000000000000000000000000000000080',
            '3132333435363738393000000000000000000000000000000000000000000000',
            '00000000000000000000000000000000000000000000000000000000000000e0',
            '0000000000000000000000000000000000000000000000000000000000000002',
            '0000000000000000000000000000000000000000000000000000000000000456',
            '0000000000000000000000000000000000000000000000000000000000000789',
            '000000000000000000000000000000000000000000000000000000000000000d',
            '48656c6c6f2c20776f726c642100000000000000000000000000000000000000',
        ].join('');

        // Act
        const result = decodeTransactionDataProcessor(contractAbi)(data);

        // Assert
        expect(result).not.toBeNull();

        if (result) {
            expect(result.functionABI).toEqual(
                FUNCTION_WITH_MIXED_TYPE_PARAMS_ABI
            );
            expect(result.params.length).toBe(4);
            expect(result.params[0].type).toBe(ValueType.BigNumber);
            expect(result.params[1].type).toBe(ValueType.Array);
            expect(result.params[2].type).toBe(ValueType.Bytes);
            expect(result.params[3].type).toBe(ValueType.Bytes);

            const arrayParamInfo = result.params[1] as ArrayParamInfo;
            expect(arrayParamInfo.value.length).toBe(2);
            arrayParamInfo.value.forEach(val =>
                expect(val.type).toBe(ValueType.BigNumber)
            );

            const bytesParamInfo = result.params[3] as BytesParamInfo;
            expect(bytesParamInfo.value).toEqual('Hello, world!');
        }
    });
});
