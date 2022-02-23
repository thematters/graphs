import { BigInt, Address } from "@graphprotocol/graph-ts";

import { Account } from "../generated/schema";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ZERO_BI = BigInt.fromI32(0);
export const ONE_BI = BigInt.fromI32(1);

export function getOrCreateAccount(address: Address): Account {
  const id = address.toHexString();

  let account = Account.load(id);

  if (account === null) {
    account = new Account(id);
    account.balance = ZERO_BI;
    account.save();
  }

  return account;
}
