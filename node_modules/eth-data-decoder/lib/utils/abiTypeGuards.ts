import {
    ABIDescription,
    ABIConstructorDescription,
    ABIEventDescription,
    ABIFallbackDescription,
    ABIFunctionDescription,
} from '../types/ABI';

export function isFunctionABI(
    abiDescription: ABIDescription
): abiDescription is ABIFunctionDescription {
    return (
        abiDescription.type === 'function' || abiDescription.type === undefined
    );
}

export function isConstructorABI(
    abiDescription: ABIDescription
): abiDescription is ABIConstructorDescription {
    return abiDescription.type === 'constructor';
}

export function isFallbackABI(
    abiDescription: ABIDescription
): abiDescription is ABIFallbackDescription {
    return abiDescription.type === 'fallback';
}

export function isEventABI(
    abiDescription: ABIDescription
): abiDescription is ABIEventDescription {
    return abiDescription.type === 'event';
}
