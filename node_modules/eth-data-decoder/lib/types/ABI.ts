export type ABIType = 'constructor' | 'function' | 'event' | 'fallback';

export type ABIStaticTypeUInt =
    | 'uint8'
    | 'uint16'
    | 'uint24'
    | 'uint32'
    | 'uint40'
    | 'uint48'
    | 'uint56'
    | 'uint64'
    | 'uint72'
    | 'uint80'
    | 'uint88'
    | 'uint96'
    | 'uint104'
    | 'uint112'
    | 'uint120'
    | 'uint128'
    | 'uint136'
    | 'uint144'
    | 'uint152'
    | 'uint160'
    | 'uint168'
    | 'uint176'
    | 'uint184'
    | 'uint192'
    | 'uint200'
    | 'uint208'
    | 'uint216'
    | 'uint224'
    | 'uint232'
    | 'uint240'
    | 'uint248'
    | 'uint256';

export type ABIStaticTypeInt =
    | 'int8'
    | 'int16'
    | 'int24'
    | 'int32'
    | 'int40'
    | 'int48'
    | 'int56'
    | 'int64'
    | 'int72'
    | 'int80'
    | 'int88'
    | 'int96'
    | 'int104'
    | 'int112'
    | 'int120'
    | 'int128'
    | 'int136'
    | 'int144'
    | 'int152'
    | 'int160'
    | 'int168'
    | 'int176'
    | 'int184'
    | 'int192'
    | 'int200'
    | 'int208'
    | 'int216'
    | 'int224'
    | 'int232'
    | 'int240'
    | 'int248'
    | 'int256';

export type APIStaticTypeBytes =
    | 'bytes1'
    | 'bytes2'
    | 'bytes3'
    | 'bytes4'
    | 'bytes5'
    | 'bytes6'
    | 'bytes7'
    | 'bytes8'
    | 'bytes9'
    | 'bytes10'
    | 'bytes11'
    | 'bytes12'
    | 'bytes13'
    | 'bytes14'
    | 'bytes15'
    | 'bytes16'
    | 'bytes17'
    | 'bytes18'
    | 'bytes19'
    | 'bytes20'
    | 'bytes21'
    | 'bytes22'
    | 'bytes23'
    | 'bytes24'
    | 'bytes25'
    | 'bytes26'
    | 'bytes27'
    | 'bytes28'
    | 'bytes29'
    | 'bytes30'
    | 'bytes31'
    | 'bytes32';

export type ABIStaticTypeOther = 'bool' | 'address' | 'function';

export type ABIStaticType =
    | ABIStaticTypeUInt
    | ABIStaticTypeInt
    | ABIStaticTypeOther;

export type ABIStateMutability = 'pure' | 'view' | 'nonpayable' | 'payable';

export type ABIBaseDescriptionStateMutability =
    | { constant: true; stateMutability?: 'pure' | 'view' }
    | { constant: boolean; stateMutability?: 'nonpayable' | 'payable' };

export interface ABIBaseDescription {
    payable: boolean;
    stateMutability?: ABIStateMutability;
    constant?: boolean;
}

export interface ABIDescriptionInput {
    name: string;
    type: ABIStaticType | string;
}

export interface ABIDescriptionOutput extends ABIDescriptionInput {
    components?: ABIDescriptionOutput;
}

export interface ABIFunctionDescription extends ABIBaseDescription {
    type?: 'function';
    name: string;
    inputs: ABIDescriptionInput[];
    outputs?: ABIDescriptionOutput[];
}

export interface ABIConstructorDescription extends ABIBaseDescription {
    type: 'constructor';
    inputs: ABIDescriptionInput[];
}

export interface ABIFallbackDescription extends ABIBaseDescription {
    type: 'fallback';
}

export interface ABIEventDescriptionInput extends ABIDescriptionInput {
    indexed: boolean;
}

export interface ABIEventDescription {
    type: 'event';
    name: string;
    inputs: ABIEventDescriptionInput;
    anonymous: boolean;
}

export type ABIDescription =
    | ABIFunctionDescription
    | ABIConstructorDescription
    | ABIFallbackDescription
    | ABIEventDescription;

export type ContractABI = Readonly<ABIDescription[]>;
