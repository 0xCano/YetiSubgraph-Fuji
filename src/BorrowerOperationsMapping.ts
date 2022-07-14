import { TroveManager } from '../generated/TroveManager/TroveManager'
import { newTrove, updatedTrove, swap, YUSDPaid, VariablePaid} from '../generated/schema'
import { Address, ethereum, Bytes, ByteArray, bigInt, BigInt} from '@graphprotocol/graph-ts'
import {TroveCreated, TroveUpdated} from "../generated/BorrowerOperations/BorrowerOperations"

//import { parseContractABI, decodeTransactionDataProcessor } from "eth-data-decoder"

function addressToBytes(address: Address): Bytes {
  return Bytes.fromHexString(address.toHexString())
}

var BorrowerOperation = ["openTrove", "closeTrove", "adjustTrove"]

// const contractABIString = BorrowerOperations
// export const contractABI = parseContractABI(contractABIString);
// export const decoder = decodeTransactionDataProcessor(contractABI);

export function getTxnInputDataToDecode(event: ethereum.Event): Bytes {
  const inputDataHexString = event.transaction.input.toHexString().slice(10); //take away function signature: '0x????????'
  const hexStringToDecode = '0x0000000000000000000000000000000000000000000000000000000000000020' + inputDataHexString; // prepend tuple offset
  return Bytes.fromByteArray(Bytes.fromHexString(hexStringToDecode));
}

export function handleTroveCreated(event: TroveCreated): void {
  let trove = new newTrove(event.transaction.hash.toHex())
  trove.borrower = event.params._borrower
  trove.arrayIndex = event.params.arrayIndex
  trove.transaction = event.transaction.hash
  trove.timestamp = event.block.timestamp
  trove.save()
}

export function handleTroveUpdated(event: TroveUpdated): void {
  let id = event.transaction.hash.toHex()
  let trove = updatedTrove.load(id)
  if (trove == null) {
    trove = new updatedTrove(id)
  } else {
    let contract = TroveManager.bind(Address.fromBytes(trove.eventAddress))
    trove.currentICR = contract.getCurrentICR(Address.fromBytes(trove.borrower))
  }
    trove.borrower = event.params._borrower
    trove.debt = event.params._debt
    trove.amounts = event.params._amounts
    trove.tokens =  event.params._tokens.map<Bytes>((token) => token)
    trove.timestamp = event.block.timestamp
    trove.operation = BorrowerOperation[event.params.operation]
    trove.transaction = event.transaction.hash
    trove.blockNum = event.block.number


    
    let s = swap.load(id)

    if (s != null) {
      if (trove.operation == 'openTrove') {
        trove.operation = 'openTroveLeverUp'
      } else if (trove.operation == 'closeTrove') {
        trove.operation = 'closeTroveUnlever'
      } else if (s.startingTokenAddress.toHex().toLowerCase() == '0x111111111111ed1D73f860F57b2798b683f2d325'.toLowerCase()) {
        trove.operation = 'Add Coll Lever Up'
      } else if (s.endingTokenAddress.toHex().toLowerCase() == '0x111111111111ed1D73f860F57b2798b683f2d325'.toLowerCase()) {
        trove.operation = 'Withdraw Coll Unlever Up'
      } else {
        trove.operation = 'Unknown'
      }
    }
      
    const dataToDecode = getTxnInputDataToDecode(event)

    let operation = trove.operation

    if (operation == 'openTrove') {
        let decoded = ethereum.decode(
          '(uint256,uint256,address,address,address[],uint256[])',
          dataToDecode
        );
        if (decoded != null) {
          let t = decoded.toTuple();
          trove.maxFeePercentage = t[0].toBigInt()
          trove.YUSDchange = t[1].toBigInt()
          trove.upperHint = t[2].toAddress()
          trove.lowerHint = t[3].toAddress()
          trove.length = t.length
          trove.temp = 'non-lever'
        }

    } else if (operation == 'openTroveLeverUp') {
        let decoded = ethereum.decode(
          '(uint256,uint256,address,address,address[],uint256[],uint256[],uint256[])',
          dataToDecode
        );
        if (decoded != null) {
          let t = decoded.toTuple();
          trove.maxFeePercentage = t[0].toBigInt()
          trove.YUSDchange = t[1].toBigInt()
          trove.upperHint = t[2].toAddress()
          trove.lowerHint = t[3].toAddress()
          trove.leverages = t[6].toBigIntArray()
          trove.maxSlippages = t[7].toBigIntArray()
          trove.length = t.length
          trove.temp = 'non-lever'
        }
    } else if (operation == 'adjustTrove') {
        let decoded = ethereum.decode(
          '(address[],uint256[],address[],uint256[],uint256,bool,address,address,uint256)',
          dataToDecode
        );
        if (decoded != null) {
          let t = decoded.toTuple();
          trove.collsIn = t[0].toAddressArray().map<Bytes>((token) => token)
          trove.amountsIn = t[1].toBigIntArray()
          trove.collsOut = t[2].toAddressArray().map<Bytes>((token) => token)
          trove.amountsOut = t[3].toBigIntArray()
          trove.YUSDchange = t[4].toBigInt()
          trove.isDebtIncrease = t[5].toBoolean()
          trove.upperHint = t[6].toAddress()
          trove.lowerHint = t[7].toAddress()
          trove.maxFeePercentage = t[8].toBigInt()
          trove.length = t.length
          trove.temp = 'non-lever'
      }
    } else if (operation == 'Add Coll Lever Up') {
        let decoded = ethereum.decode(
          '(address[],uint256[],uint256[],uint256[],uint256,address,address,uint256)',
          dataToDecode
        );
        if (decoded != null) {
          let t = decoded.toTuple();
          trove.collsIn = t[0].toAddressArray().map<Bytes>((token) => token)
          trove.amountsIn = t[1].toBigIntArray()
          trove.leverages = t[2].toBigIntArray()
          trove.maxSlippages = t[3].toBigIntArray()
          trove.YUSDchange = t[4].toBigInt()
          trove.upperHint = t[5].toAddress()
          trove.lowerHint = t[6].toAddress()
          trove.maxFeePercentage = t[7].toBigInt()
          trove.length = t.length
          trove.temp = 'lever'
      }
    } else if (operation == 'Withdraw Coll Unlever Up') {
        let decoded = ethereum.decode(
          '(address[],uint256[],uint256[],uint256,address,address)',
          dataToDecode
        );
        if (decoded != null) {
          let t = decoded.toTuple();
          trove.collsOut = t[0].toAddressArray().map<Bytes>((token) => token)
          trove.amountsOut = t[1].toBigIntArray()
          trove.maxSlippages = t[2].toBigIntArray()
          trove.YUSDchange = t[3].toBigInt()
          trove.upperHint = t[4].toAddress()
          trove.lowerHint = t[5].toAddress()
          trove.length = t.length
          trove.temp = 'lever'
        }
    } else if (operation == 'closeTroveUnlever') {
        let decoded = ethereum.decode(
          '(address[],uint256[],uint256[])',
          dataToDecode
        );
        if (decoded != null) {
          let t = decoded.toTuple();
          trove.collsOut = t[0].toAddressArray().map<Bytes>((token) => token)
          trove.amountsOut = t[1].toBigIntArray()
          trove.maxSlippages = t[2].toBigIntArray()
          trove.length = t.length
          trove.temp = 'lever'
        }
    }
    trove.save()
}



// export function handleYUSDPaid(event: YUSDBorrowingFeePaid): void {
//   let id = event.transaction.hash.toHex()
//   let yusdPaid =  new YUSDPaid(id)
//   yusdPaid.borrower = event.params._borrower
//   yusdPaid.fee = event.params._YUSDFee
//   let trove = updatedTrove.load(id)
//   if (trove && trove.operation == 'openTrove') {
//     let variablePaid = VariablePaid.load(id)
//     if (variablePaid) {
//       const fee = event.params._YUSDFee.minus(variablePaid.fee)
//       yusdPaid.fee = fee
//     }
//   }
//   yusdPaid.transaction = event.transaction.hash
//   yusdPaid.blockNum = event.block.number
//   yusdPaid.timestamp = event.block.timestamp
//   yusdPaid.save()
// }

// export function handleVariablePaid(event: VariableFeePaid): void {
//   let id = event.transaction.hash.toHex()
//   let variablePaid =  new VariablePaid(id)
//   variablePaid.borrower = event.params._borrower
//   variablePaid.fee = event.params._YUSDVariableFee
//   let trove = updatedTrove.load(id)
//   if (trove && trove.operation == 'openTrove') {
//     let yusdPaid = YUSDPaid.load(id)
//     if (yusdPaid) {
//       const fee = yusdPaid.fee.minus(event.params._YUSDVariableFee)
//       yusdPaid.fee = fee
//       yusdPaid.save()
//     }
//   }
//   variablePaid.transaction = event.transaction.hash
//   variablePaid.blockNum = event.block.number
//   variablePaid.timestamp = event.block.timestamp
//   variablePaid.save()
// }

