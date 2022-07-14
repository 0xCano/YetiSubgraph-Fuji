import * as BigNumber from 'bignumber.js';
import { findFunctionABIProcessor } from '../utils/findFunctionABI';
import { splitData, splitFunctionSelector } from '../utils/splitData';
import {
    decodeAddress,
    decodeBoolean,
    decodeDynamicArray,
    decodeDynamicBytes,
    decodeNumber,
    decodeString,
} from './decodeValues';
import {
    ContractABI,
    ABIFunctionDescription,
    ABIDescriptionInput,
} from '../types/ABI';

export enum ValueType {
    Address,
    Array,
    Bytes,
    BigNumber,
    String,
    Boolean,
    Unknown,
}

export interface BaseParamInfo<T extends ValueType, V> {
    type: T;
    value: V;
    rawValue: string;
    abi: ABIDescriptionInput;
}

export type NumberParamInfo = BaseParamInfo<
    ValueType.BigNumber,
    BigNumber.BigNumber
>;
export type AddressParamInfo = BaseParamInfo<ValueType.Address, string>;
export type StringParamInfo = BaseParamInfo<ValueType.String, string>;
export type BooleanParamInfo = BaseParamInfo<ValueType.Boolean, boolean>;
export type BytesParamInfo = BaseParamInfo<ValueType.Bytes, string>;

export interface UnknownParamInfo {
    type: ValueType.Unknown;
    value: string;
    rawValue: string;
}

export type NonArrayParamInfo =
    | AddressParamInfo
    | BytesParamInfo
    | NumberParamInfo
    | StringParamInfo
    | BooleanParamInfo
    | UnknownParamInfo;

export type ArrayParamInfo = BaseParamInfo<
    ValueType.Array,
    NonArrayParamInfo[]
>;

export type ParamInfo = NonArrayParamInfo | ArrayParamInfo;

export interface DecodedTransactionData {
    functionABI: ABIFunctionDescription;
    functionSelector: string;
    params: ParamInfo[];
}

export function decodeTransactionDataProcessor(
    contractABI: ContractABI
): (data: string) => DecodedTransactionData | null {
    const functionFinder = findFunctionABIProcessor(contractABI);

    return (data: string) => {
        const { functionSelector, params } = splitData(data);
        const functionABI = functionFinder(functionSelector);
        if (functionABI) {
            return {
                functionABI,
                functionSelector,
                params: matchDataParamsWithABIParams(
                    params,
                    functionABI.inputs
                ),
            };
        } else {
            return null;
        }
    };
}

export function decodeTransactionFunctionProcessor(
    contractABI: ContractABI
): (data: string) => ABIFunctionDescription | null {
    const functionFinder = findFunctionABIProcessor(contractABI);
    return (data: string) => {
        const functionSelector = splitFunctionSelector(data);
        return functionFinder(functionSelector);
    };
}

function matchDataParamsWithABIParams(
    params: string[],
    inputABI: ABIDescriptionInput[]
): ParamInfo[] {
    let paramIndex = 0;
    return inputABI.map(input => {
        const { info, nextParamIndex } = decodeParam(paramIndex, params, input);
        paramIndex = nextParamIndex;

        return info;
    });
}

function isDynamicType(type: string) {
    return (
        type.indexOf('[]') !== -1 ||
        type === 'bytes' ||
        type === 'bytes[' ||
        type === 'string' ||
        type === 'string['
    );
}

const isStaticType = (type: string) => !isDynamicType(type);

function decodeParam(
    paramIndex: number,
    params: string[],
    inputABI: ABIDescriptionInput
): { info: ParamInfo; nextParamIndex: number } {
    if (isStaticType(inputABI.type)) {
        return decodeStaticParam(paramIndex, params, inputABI);
    } else {
        return decodeDynamicParam(paramIndex, params, inputABI);
    }
}

const TYPE_MATCHER = /^([a-zA-Z0-9]+).*/;

function decodeDynamicParam(
    paramIndex: number,
    params: string[],
    inputABI: ABIDescriptionInput
): { info: ParamInfo; nextParamIndex: number } {
    const typeMatch = TYPE_MATCHER.exec(inputABI.type);

    if (typeMatch) {
        const [, type] = typeMatch;

        if (type === 'bytes') {
            const { value, rawValue } = decodeDynamicBytes(paramIndex, params);

            return {
                info: {
                    type: ValueType.Bytes,
                    value,
                    rawValue,
                    abi: inputABI,
                },
                // As dynamic data is after all static parameter values hence the next
                // param to be decoded should be the immediate next one
                nextParamIndex: paramIndex + 1,
            };
        } else {
            const { value, rawValue } = decodeDynamicArray(
                paramIndex,
                params,
                (paramIndex, params) =>
                    decodeNonArrayStaticParam(paramIndex, params, {
                        ...inputABI,
                        type,
                    })
            );
            return {
                info: {
                    type: ValueType.Array,
                    value,
                    rawValue,
                    abi: inputABI,
                },
                // As dynamic data is after all static parameter values hence the next
                // param to be decoded should be the immediate next one
                nextParamIndex: paramIndex + 1,
            };
        }
    }

    throw new Error('Invalid input ABI');
}

const STATIC_TYPED_ARRAY_MATCHER = /^(\D+)(\d.)\[(\d+)\]$/g;
function decodeStaticParam(
    paramIndex: number,
    params: string[],
    inputABI: ABIDescriptionInput
): { info: ParamInfo; nextParamIndex: number } {
    const arrayMatch = STATIC_TYPED_ARRAY_MATCHER.exec(inputABI.type);
    if (arrayMatch) {
        const [, type, , arraySize] = arrayMatch;
        const arraySizeNum = parseInt(arraySize);

        const values: NonArrayParamInfo[] = [];
        let arrayParamIndex = paramIndex;
        for (let i = 0; i < arraySizeNum; i++) {
            const { info, nextParamIndex } = decodeNonArrayStaticParam(
                arrayParamIndex,
                params,
                { ...inputABI, type }
            );
            values.push(info);
            arrayParamIndex = nextParamIndex;
        }

        return {
            info: {
                type: ValueType.Array,
                value: values,
                rawValue: params.slice(paramIndex, arrayParamIndex).join(''),
                abi: inputABI,
            },
            nextParamIndex: arrayParamIndex,
        };
    } else {
        return decodeNonArrayStaticParam(paramIndex, params, inputABI);
    }
}

function decodeNonArrayStaticParam(
    paramIndex: number,
    params: string[],
    inputABI: ABIDescriptionInput
): { info: NonArrayParamInfo; nextParamIndex: number } {
    const param = params[paramIndex];
    let paramInfo: NonArrayParamInfo;

    if (
        inputABI.type.startsWith('uint') ||
        inputABI.type.startsWith('int') ||
        inputABI.type.startsWith('fixed') ||
        inputABI.type.startsWith('ufixed')
    ) {
        paramInfo = {
            type: ValueType.BigNumber,
            value: decodeNumber(param),
            rawValue: param,
            abi: inputABI,
        };
    } else if (inputABI.type.startsWith('address')) {
        paramInfo = {
            type: ValueType.Address,
            value: decodeAddress(param),
            rawValue: param,
            abi: inputABI,
        };
    } else if (inputABI.type === 'bool') {
        paramInfo = {
            type: ValueType.Boolean,
            value: decodeBoolean(param),
            rawValue: param,
            abi: inputABI,
        };
    } else if (inputABI.type.startsWith('bytes')) {
        paramInfo = {
            type: ValueType.Bytes,
            value: decodeString(param), // Decode bytes as string
            rawValue: param,
            abi: inputABI,
        };
    } else {
        paramInfo = {
            type: ValueType.Unknown,
            rawValue: param,
            value: param,
        };
    }

    return {
        info: paramInfo,
        nextParamIndex: paramIndex + 1,
    };
}
