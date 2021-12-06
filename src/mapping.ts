import { BigInt } from "@graphprotocol/graph-ts"

import {
  Traveloggers,
  Approval,
  ApprovalForAll,
  LogbookNewLog,
  LotteryWinners,
  OwnershipTransferred,
  PreOrderMinted,
  Transfer,
} from "../generated/Traveloggers/Traveloggers"
import { Log, Logbook } from "../generated/schema"

// create logbook or update owner
export function handleTransfer(event: Transfer): void {
  let logbook = Logbook.load(`${event.params.tokenId}`)

  if (!logbook) {
    const traveloggers = Traveloggers.bind(event.address)

    logbook = new Logbook(event.params.tokenId.toString())
    logbook.uri = traveloggers.tokenURI(event.params.tokenId)
    logbook.length = BigInt.fromI32(0)
  }

  logbook.owner = event.params.to
  logbook.save()
}

// create logs
export function handleLogbookNewLog(event: LogbookNewLog): void {
  const traveloggers = Traveloggers.bind(event.address)

  // concat token id and log index as log id
  const log = new Log(
    `${event.params.tokenId.toString()}-${event.params.index.toString()}`
  )

  // sender address
  log.author = event.params.sender

  // logbook id
  log.book = `${event.params.tokenId.toString()}`

  // log timestamp
  log.createdAt = event.block.timestamp

  // log content
  const allContent = traveloggers.readLogbook(event.params.tokenId).logs
  const index = event.params.index.toI32()
  log.content = allContent[index].message

  // save changes
  log.save()

  // update logbook length
  const logbook = new Logbook(event.params.tokenId.toString())
  logbook.length = event.params.index
  logbook.save()
}

export function handleApproval(event: Approval): void {}

export function handleApprovalForAll(event: ApprovalForAll): void {}

export function handleLotteryWinners(event: LotteryWinners): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePreOrderMinted(event: PreOrderMinted): void {}
