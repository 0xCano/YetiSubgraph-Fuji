const _4_BYTES_STR_LENGTH = 4 * 2;
const _32_BYTES_STR_LENGTH = 32 * 2;

export function splitData(
    data: string
): { functionSelector: string; params: string[] } {
    if (!data.startsWith('0x')) {
        throw new Error('Invalid data provided');
    }

    const dataArr = data.split('');

    const functionSelector = dataArr.slice(2, 2 + _4_BYTES_STR_LENGTH).join('');
    const restOfData = dataArr.slice(10);

    if (restOfData.length % _32_BYTES_STR_LENGTH !== 0) {
        throw new Error('The data was malformed');
    }

    const params: string[] = [];
    for (
        let index = 0;
        index < restOfData.length;
        index += _32_BYTES_STR_LENGTH
    ) {
        const param = restOfData.slice(index, index + _32_BYTES_STR_LENGTH);
        params.push(param.join(''));
    }

    return { functionSelector, params };
}

export function splitFunctionSelector(data: string): string {
    if (!data.startsWith('0x')) {
        throw new Error('Invalid data provided');
    }

    const dataArr = data.split('');

    const functionSelector = dataArr.slice(2, 2 + _4_BYTES_STR_LENGTH).join('');
    return functionSelector;
}
