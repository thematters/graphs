import {
  Donate,
  Fork as ForkEvent,
  Pay as PayEvent,
  Content,
  Publish,
  SetDescription,
  SetForkPrice,
  SetTitle,
  Transfer,
  Withdraw
} from "../generated/Logbook/Logbook";
import {
  Logbook,
  Log,
  Account,
  Donation,
  Fork,
  Pay,
  Publication
} from "../generated/schema";
import {
  getOrCreateAccount,
  getTokenURI,
  ONE_BI,
  ZERO_ADDRESS,
  ZERO_BI
} from "./helpers";

export function handleDonate(event: Donate): void {
  const logbookId = event.params.tokenId.toHexString();
  const donor = getOrCreateAccount(event.params.donor);
  const txHash = event.transaction.hash.toHexString();

  // create donation
  let donation = new Donation(txHash);
  donation.to = logbookId;
  donation.donor = donor.id;
  donation.amount = event.params.amount;
  donation.createdAt = event.block.timestamp;
  donation.txHash = txHash;
  donation.save();

  // update logbook
  let logbook = Logbook.load(logbookId);
  if (logbook) {
    logbook.donationCount = logbook.donationCount.plus(ONE_BI);
    logbook.save();
  }
}

export function handleFork(event: ForkEvent): void {
  const fromLogbookId = event.params.tokenId.toHexString();
  const toLogbookId = event.params.newTokenId.toHexString();
  const endLogId = event.params.end.toHexString();
  const txHash = event.transaction.hash.toHexString();

  // create fork
  const forkId = `${fromLogbookId}-${toLogbookId}`;
  let fork = new Fork(forkId);
  fork.from = fromLogbookId;
  fork.to = toLogbookId;
  fork.end = endLogId;
  fork.amount = event.params.amount;
  fork.createdAt = event.block.timestamp;
  fork.txHash = txHash;
  fork.save();

  // update "from" logbook
  let logbook = Logbook.load(fromLogbookId);
  if (logbook) {
    logbook.forkCount = logbook.forkCount.plus(ONE_BI);
    logbook.save();
  }

  // update log
  let log = Log.load(endLogId);
  if (log) {
    log.logbooks = log.logbooks.concat([toLogbookId]);
    log.save();
  }
}

export function handlePay(event: PayEvent): void {
  const logbookId = event.params.tokenId.toHexString();
  const sender = getOrCreateAccount(event.params.sender);
  const recipient = getOrCreateAccount(event.params.recipient);
  const amount = event.params.amount;
  const purpose = event.params.purpose;
  const txHash = event.transaction.hash.toHexString();
  const logIndex = event.logIndex;
  const payId = txHash + logIndex.toHexString();

  // create pay
  let pay = new Pay(payId);
  pay.to = logbookId;
  pay.sender = sender.id;
  pay.recipient = recipient.id;
  pay.amount = amount;
  pay.purpose = purpose === 0 ? "Fork" : "Donate";
  pay.createdAt = event.block.timestamp;
  pay.txHash = txHash;
  pay.save();

  // update account
  recipient.balance = recipient.balance.plus(amount);
  recipient.save();
}

export function handleContent(event: Content): void {
  const logId = event.params.contentHash.toHexString();
  const author = getOrCreateAccount(event.params.author);
  const txHash = event.transaction.hash.toHexString();

  // create log
  let log = Log.load(logId);
  if (log === null) {
    log = new Log(logId);
    log.author = author.id;
    log.content = event.params.content;
    log.source = null;
    log.logbooks = [];
    log.createdAt = event.block.timestamp;
    log.txHash = txHash;
    log.save();
  }
}

export function handlePublish(event: Publish): void {
  const logbookId = event.params.tokenId.toHexString();
  const logId = event.params.contentHash.toHexString();
  const txHash = event.transaction.hash.toHexString();
  const logIndex = event.logIndex;
  const publicationId = txHash + logIndex.toHexString();

  // create publication
  let publication = Publication.load(publicationId);
  if (publication === null) {
    publication = new Publication(publicationId);
    publication.log = logId;
    publication.logbook = logbookId;
    publication.createdAt = event.block.timestamp;
    publication.txHash = txHash;
    publication.save();
  }

  // update logbook
  let logbook = Logbook.load(logbookId);
  if (logbook) {
    logbook.tokenURI = getTokenURI(event.params.tokenId, event.address);
    logbook.loggedAt = event.block.timestamp;
    logbook.publicationCount = logbook.publicationCount.plus(ONE_BI);
    logbook.save();
  }

  // update log
  let log = Log.load(logId);
  if (log) {
    if (!log.source) {
      log.source = logbookId;
    }

    log.logbooks = log.logbooks.concat([logbookId]);
    log.save();
  }
}

export function handleSetDescription(event: SetDescription): void {
  const logbookId = event.params.tokenId.toHexString();
  let logbook = Logbook.load(logbookId);

  if (logbook) {
    logbook.description = event.params.description;
    logbook.save();
  }
}

export function handleSetForkPrice(event: SetForkPrice): void {
  const logbookId = event.params.tokenId.toHexString();
  let logbook = Logbook.load(logbookId);

  if (logbook) {
    logbook.forkPrice = event.params.amount;
    logbook.save();
  }
}

export function handleSetTitle(event: SetTitle): void {
  const logbookId = event.params.tokenId.toHexString();
  let logbook = Logbook.load(logbookId);

  if (logbook) {
    logbook.title = event.params.title;
    logbook.save();
  }
}

export function handleTransfer(event: Transfer): void {
  const to = getOrCreateAccount(event.params.to);

  // get or create logbook
  const logbookId = event.params.tokenId.toHexString();
  let logbook = Logbook.load(logbookId);
  if (logbook === null) {
    logbook = new Logbook(logbookId);
    logbook.tokenURI = getTokenURI(event.params.tokenId, event.address);
    logbook.createdAt = event.block.timestamp;
    logbook.loggedAt = null;
    logbook.title = "";
    logbook.description = "";
    logbook.forkPrice = ZERO_BI;
    logbook.publicationCount = ZERO_BI;
    logbook.forkCount = ZERO_BI;
    logbook.donationCount = ZERO_BI;
    logbook.transferCount = ZERO_BI;
  } else {
    logbook.transferCount = logbook.transferCount.plus(ONE_BI);
  }
  logbook.owner = to.id;
  logbook.save();
}

export function handleWithdraw(event: Withdraw): void {
  const accountId = event.params.account.toHexString();
  let account = Account.load(accountId);

  if (!account) return;

  account.balance = ZERO_BI;
  account.save();
}
