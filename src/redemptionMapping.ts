import { newRedemption, updatedTrove } from "../generated/schema"
import { Redemption } from "../generated/TroveManagerRedemptions/TroveManagerRedemptions"
import { TroveUpdated } from "../generated/TroveManager/TroveManager"
import { Address, Bytes } from "@graphprotocol/graph-ts"

function addressToBytes(address: Address): Bytes {
    return Bytes.fromHexString(address.toHexString())
  }

export function handleRedemption(event: Redemption): void {
    let id = event.transaction.hash.toHex()
    let redemption = newRedemption.load(id)
    if (redemption == null) {
        redemption = new newRedemption(id)
    }
    redemption.attemptedYUSDAmount = event.params._attemptedYUSDAmount
    redemption.YUSDPaid = event.params.YUSDfee
    redemption.actualYUSDAmount = event.params._actualYUSDAmount
    redemption.tokens = event.params.tokens.map<Bytes>((token) => {return addressToBytes(token)})
    redemption.amounts = event.params.amounts
    redemption.transaction = event.transaction.hash
    redemption.blockNum = event.block.number
    redemption.timestamp = event.block.timestamp
    redemption.save()
  }

  export function handleTroveUpdated(event: TroveUpdated): void {
    let id = event.transaction.hash.toHex()
    let redemption = updatedTrove.load(id)
    if (redemption == null) {
        redemption = new updatedTrove(id)
    }
    redemption.borrower = event.params._borrower
    redemption.debt = event.params._debt
    redemption.tokens = event.params._tokens.map<Bytes>((token) => {return addressToBytes(token)})
    redemption.amounts = event.params._amounts
    redemption.transaction = event.transaction.hash
    redemption.timestamp = event.block.timestamp
    redemption.blockNum = event.block.number
    redemption.operation = 'redeemCollateral'
    redemption.save()
  }





