import { ContractABI } from '../types/ABI';

export function parseContractABI(abi: string | null): ContractABI | null {
    return abi ? JSON.parse(abi) : null;
}
