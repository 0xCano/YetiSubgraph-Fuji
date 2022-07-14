import {CollateralAdded, CollateralDeprecated, CollateralUndeprecated, DeprecateAllCollateralCall, DeprecateCollateralCall} from '../generated/YetiController/YetiController'
import {collateral} from '../generated/schema'

export function handleCollateralAdded(event: CollateralAdded): void {
    let id = event.transaction.hash.toHex()
    let col = new collateral(id)
    col.address = event.params._collateral
    col.status = 'Added'
    col.timestamp = event.block.timestamp
    col.transaction = event.transaction.hash
    col.blockNum = event.block.number
    col.save()
}

export function handleCollateralDeprecated(event: CollateralDeprecated): void {
    let id = event.transaction.hash.toHex()
    let col = collateral.load(id)
    if (!col) {
        col = new collateral(id)
    }
    col.address = event.params._collateral
    col.status = 'Deprecated'
    col.timestamp = event.block.timestamp
    col.transaction = event.transaction.hash
    col.blockNum = event.block.number
    col.save()
}

export function handleDeprecateCollateral(call: DeprecateCollateralCall): void {
    let id = call.transaction.hash.toHex()
    let col = collateral.load(id)
    if (!col) {
        col = new collateral(id)
    }
    col.address = call.inputs._collateral
    col.status = 'Undeprecated call'
    col.timestamp = call.block.timestamp
    col.transaction = call.transaction.hash
    col.blockNum = call.block.number
    col.save()
}

