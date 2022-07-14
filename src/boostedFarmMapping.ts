import {BoostedFarm, Deposit, Withdraw, EmergencyWithdraw} from "../generated/BoostedFarm/BoostedFarm"
import { farmOperation } from "../generated/schema"

export function handleDeposit(event: Deposit): void {
    let id = event.transaction.hash.toHex()
    let deposit = farmOperation.load(id)
    if (deposit == null) {
        deposit = new farmOperation(id)
    }
    deposit.user = event.params.user
    const contract = BoostedFarm.bind(event.address)
    deposit.boostedPartition = contract.boostedPartition()
    deposit.rewardRate = contract.rewardRate()
    deposit.amountOfLP = contract.userInfo(event.params.user).value0
    deposit.userFactor = contract.userInfo(event.params.user).value2
    deposit.sumOfFactors = contract.sumOfFactors()
    deposit.amount = event.params.amount
    deposit.operation = 'Deposit'
    deposit.timestamp = event.block.timestamp
    deposit.blockNum = event.block.number
    deposit.save()
}


export function handleWithdraw(event: Withdraw): void {
    let id = event.transaction.hash.toHex()
    let deposit = farmOperation.load(id)
    if (deposit == null) {
        deposit = new farmOperation(id)
    }
    deposit.user = event.params.user
    const contract = BoostedFarm.bind(event.address)
    deposit.boostedPartition = contract.boostedPartition()
    deposit.rewardRate = contract.rewardRate()
    deposit.amountOfLP = contract.userInfo(event.params.user).value0
    deposit.userFactor = contract.userInfo(event.params.user).value2
    deposit.sumOfFactors = contract.sumOfFactors()
    deposit.amount = event.params.amount
    deposit.operation = 'Withdraw'
    deposit.timestamp = event.block.timestamp
    deposit.blockNum = event.block.number
    deposit.save()
}

export function handleEmergencyWithdraw(event: Withdraw): void {
    let id = event.transaction.hash.toHex()
    let deposit = farmOperation.load(id)
    if (deposit == null) {
        deposit = new farmOperation(id)
    }
    deposit.user = event.params.user
    const contract = BoostedFarm.bind(event.address)
    deposit.boostedPartition = contract.boostedPartition()
    deposit.rewardRate = contract.rewardRate()
    deposit.amountOfLP = contract.userInfo(event.params.user).value0
    deposit.userFactor = contract.userInfo(event.params.user).value2
    deposit.sumOfFactors = contract.sumOfFactors()
    deposit.amount = event.params.amount
    deposit.operation = 'Emergency Withdraw'
    deposit.timestamp = event.block.timestamp
    deposit.blockNum = event.block.number
    deposit.save()
}