import * as BigNumber from 'bignumber.js';

const _1_BYTE_STR_LENGTH = 2;

export function decodeDynamicBytes(
    paramIndex: number,
    params: string[]
): { value: string; rawValue: string; nextParamIndex: number } {
    let bytesDataIndex = Math.floor(
        decodeNumber(params[paramIndex]).toNumber() / 32
    );

    const numberOfBytes = decodeNumber(params[bytesDataIndex]).toNumber();
    bytesDataIndex += 1;
    const totalParams = Math.ceil(numberOfBytes / 32);

    const byteArr: string[] = [];
    const rawByteArr: string[] = [];

    for (let i = 0; i < totalParams; i++) {
        const param = params[bytesDataIndex];

        rawByteArr.push(param);
        byteArr.push(decodeString(param));

        bytesDataIndex += 1;
    }

    return {
        value: byteArr.join(''),
        rawValue: rawByteArr.join(''),
        nextParamIndex: paramIndex + 1,
    };
}

export function decodeDynamicArray<T>(
    paramIndex: number,
    params: string[],
    arrayValueDecoder: (
        paramIndex: number,
        params: string[]
    ) => { info: T; nextParamIndex: number }
): { value: T[]; rawValue: string; nextParamIndex: number } {
    let arrayDataIndex = Math.floor(
        decodeNumber(params[paramIndex]).toNumber() / 32
    );

    const arraySize = decodeNumber(params[arrayDataIndex]).toNumber();
    arrayDataIndex += 1;

    const valueArr: T[] = [];
    const rawValueArr: string[] = [];

    for (let i = 0; i < arraySize; i++) {
        const param = params[arrayDataIndex];

        rawValueArr.push(param);
        const { info: value, nextParamIndex } = arrayValueDecoder(
            arrayDataIndex,
            params
        );
        valueArr.push(value);

        arrayDataIndex = nextParamIndex;
    }

    return {
        value: valueArr,
        rawValue: rawValueArr.join(''),
        nextParamIndex: paramIndex + 1,
    };
}

export function decodeString(data: string): string {
    // As strings in ABI are padded with 0 at the end so we remove them
    const paddingRemovedData = trimZeroFromEnd(data);

    const strArr: string[] = [];

    for (let i = 0; i < paddingRemovedData.length; i += _1_BYTE_STR_LENGTH) {
        const utf8Value = parseInt(
            paddingRemovedData.slice(i, i + _1_BYTE_STR_LENGTH),
            16 /* base */
        );
        strArr.push(String.fromCharCode(utf8Value));
    }

    return strArr.join('');
}

export function decodeNumber(data: string): BigNumber.BigNumber {
    // As number in ABI are padded with 0 in the beginning so we remove them
    const paddingRemovedData = trimZeroFromStart(data);

    if (paddingRemovedData === '') {
        // The value was all zero so we return zero for it
        return new BigNumber.BigNumber(0);
    }

    return new BigNumber.BigNumber(paddingRemovedData, 16 /* base */);
}

export function decodeBoolean(data: string): boolean {
    const paddingRemovedData = trimZeroFromStart(data);

    return !!parseInt(paddingRemovedData);
}

export function decodeAddress(data: string): string {
    return trimZeroFromStart(data);
}

function trimZeroFromStart(str: string) {
    return str.replace(/^0+/g, '');
}

function trimZeroFromEnd(str: string) {
    return str.replace(/0+$/g, '');
}
