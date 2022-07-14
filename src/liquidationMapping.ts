import { Liquidation, TroveUpdated } from "../generated/TroveManagerLiquidations/TroveManagerLiquidations"
import { newLiquidation, updatedTrove } from "../generated/schema"
import { Address, Bytes } from "@graphprotocol/graph-ts"

function addressToBytes(address: Address): Bytes {
    return Bytes.fromHexString(address.toHexString())
  }

  var TroveManagerOperation = ["applyPendingRewards", "liquidateInNormalMode", 
  "liquidateInRecoveryMode", "redeemCollateral"]

export function handleLiquidation(event: Liquidation): void {
    let id = event.block.transactionsRoot.toHex()
    let liquidation = new newLiquidation(id)
    liquidation.liquidatedAmount = event.params.liquidatedAmount
    liquidation.totalCollAmounts = event.params.totalCollAmounts
    liquidation.totalCollTokens = event.params.totalCollTokens.map<Bytes>((token) => {return addressToBytes(token)})
    liquidation.totalCollGasCompAmounts = event.params.totalCollGasCompAmounts
    liquidation.totalCollTokens = event.params.totalCollGasCompTokens.map<Bytes>((token) => {return addressToBytes(token)})
    liquidation.totalYUSDGasCompensation = event.params.totalYUSDGasCompensation
    liquidation.timestamp = event.block.timestamp
    liquidation.save()
  }

  export function handleTroveUpdated(event: TroveUpdated): void {
    let id = event.transaction.hash.toHex()
    let trove = updatedTrove.load(id)
    if (trove == null) {
      trove = new updatedTrove(id)
    }
    trove.borrower = event.params._borrower
    trove.debt = event.params._debt
    trove.tokens =  event.params._tokens.map<Bytes>((token) => {return addressToBytes(token)})
    trove.amounts = event.params._amounts
    trove.timestamp = event.block.timestamp
    trove.blockNum = event.block.number
    trove.transaction = event.transaction.hash
    trove.operation = TroveManagerOperation[event.params.operation]
    trove.save()    
  }