import { findFunctionABI } from '../../lib/utils/findFunctionABI';
import {
    ContractABI,
    ABIFunctionDescription,
    ABIConstructorDescription,
} from '../../lib/types/ABI';

const TRANSFORM_FUNCTION_SELECTOR = 'a9059cbb';
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

const CONSTRUCTOR_ABI = Object.freeze<ABIConstructorDescription>({
    inputs: [],
    payable: false,
    type: 'constructor',
});

describe('findFunctionABI', () => {
    it('should find the function abi when selector matches', () => {
        // Arrange
        const contractAbi: ContractABI = [
            TRANSFORM_FUNCTION_ABI,
            CONSTRUCTOR_ABI,
        ];

        // Act
        const result = findFunctionABI(
            TRANSFORM_FUNCTION_SELECTOR,
            contractAbi
        );

        // Assert
        expect(result).toBe(TRANSFORM_FUNCTION_ABI);
    });

    it('returns null when no ABI is found for the selector', () => {
        // Arrange
        const contractAbi: ContractABI = [CONSTRUCTOR_ABI];

        // Act
        const result = findFunctionABI(
            TRANSFORM_FUNCTION_SELECTOR,
            contractAbi
        );

        // Assert
        expect(result).toBeNull();
    });
});
