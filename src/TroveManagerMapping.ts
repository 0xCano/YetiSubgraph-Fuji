import { TroveUpdated, TroveManager, TotalStakesUpdated} from '../generated/TroveManager/TroveManager'
import {updatedTrove, totalStake, newLiquidation} from '../generated/schema'
import { Bytes } from '@graphprotocol/graph-ts'
import { Address} from '@graphprotocol/graph-ts'
import { Liquidation } from '../generated/TroveManagerLiquidations/TroveManagerLiquidations'

function addressToBytes(address: Address): Bytes {
  return Bytes.fromHexString(address.toHexString())
}

var BorrowerOperation = ["openTrove", "closeTrove", "adjustTrove"]

export function handleTroveUpdated(event: TroveUpdated): void {
  let id = event.block.transactionsRoot.toHex()
  let trove = new updatedTrove(id)
  trove.borrower = event.params._borrower
  trove.debt = event.params._debt
  trove.amounts = event.params._amounts
  trove.transaction = event.transaction.hash
  trove.timestamp = event.block.timestamp
  trove.operation = BorrowerOperation[event.params.operation]
  trove.tokens =  event.params._tokens.map<Bytes>((token) => token)
  trove.eventAddress = event.address
  trove.save()
}

export function handleTotalStakesUpdated(event: TotalStakesUpdated): void {
  let id = event.transaction.hash.toHex()
  let TotalStakes = new totalStake(id)
  TotalStakes.token = event.params.token
  TotalStakes.newTotalStakes = event.params._newTotalStakes
  TotalStakes.save()
  let trove = updatedTrove.load(id)
  if (trove == null) {
    trove = new updatedTrove(id)
    trove.eventAddress = event.address
    trove.save()
  }
}

