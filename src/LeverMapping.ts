

import {Swap} from "../generated/Lever/Lever"
import {swap} from "../generated/schema"
import { updatedTrove } from "../generated/schema"

export function handleSwap (event: Swap): void {
    let id = event.transaction.hash.toHex()
    let s = new swap(id)
    s.startingTokenAddress = event.params.startingTokenAddress
    s.endingTokenAddress = event.params.endingTokenAddress
    s.amount = event.params.amount
    s.minswapAmount = event.params.minSwapAmount
    s.caller = event.params.caller
    s.actualOut = event.params.actualOut
    s.timestamp = event.block.timestamp
    s.transaction = event.transaction.hash
    s.blockNum = event.block.number
    s.save()

    let update = updatedTrove.load(id)
    if (update != null) {
        if (event.params.startingTokenAddress.toHex() == '0x111111111111ed1D73f860F57b2798b683f2d325') {
            update.operation = 'Add Coll Lever Up'
        }
        else if (event.params.endingTokenAddress.toHex() == '0x111111111111ed1D73f860F57b2798b683f2d325') {
            update.operation = 'Withdraw Coll Unlever Up'
        } else {
            update.operation = 'Unknown'
        }
        update.save()
    }
}