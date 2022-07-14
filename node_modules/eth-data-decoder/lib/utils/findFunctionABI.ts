import { ABIFunctionDescription, ContractABI } from '../types/ABI';
import { isFunctionABI } from './abiTypeGuards';
import { keccak256 } from './keccak256';

const _4_BYTES_STR_LENGTH = 4 * 2;

export function findFunctionABI(
    functionSelector: string,
    contractABI: ContractABI
): ABIFunctionDescription | null {
    const functionSelectorMap = getFunctionSelectorMap(contractABI);
    return functionSelectorMap[functionSelector] || null;
}

export function findFunctionABIProcessor(
    contractABI: ContractABI
): (functionSelector: string) => ABIFunctionDescription | null {
    const functionSelectorMap = getFunctionSelectorMap(contractABI);
    return (functionSelector: string) => {
        return functionSelectorMap[functionSelector] || null;
    };
}

function getFunctionSelector(functionABI: ABIFunctionDescription) {
    const params = functionABI.inputs.map(input => input.type).join(',');

    const functionSelector = `${functionABI.name}(${params})`;

    const digest = keccak256(functionSelector);
    return digest.slice(0, _4_BYTES_STR_LENGTH);
}

function getFunctionSelectorMap(
    contractABI: ContractABI
): { [selector: string]: ABIFunctionDescription } {
    const functionABIs = contractABI.filter(isFunctionABI);

    const functionSelectorMap = functionABIs
        .map(abi => ({
            selector: getFunctionSelector(abi),
            abi: abi,
        }))
        .reduce<{ [selector: string]: ABIFunctionDescription }>((agg, info) => {
            const { selector, abi } = info;
            agg[selector] = abi;

            return agg;
        }, {});

    return functionSelectorMap;
}
