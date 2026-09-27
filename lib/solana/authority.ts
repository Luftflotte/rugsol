import { TokenContext } from "./connection";

export interface AuthorityCheckResult {
  status: "pass" | "fail";
  value: string;
}

export function checkMintAuthority(
  context: TokenContext
): AuthorityCheckResult {
  if (context.mintAuthority === null) {
    return { status: "pass", value: "Revoked" };
  }
  return { status: "fail", value: context.mintAuthority };
}

export function checkFreezeAuthority(
  context: TokenContext
): AuthorityCheckResult {
  if (context.freezeAuthority === null) {
    return { status: "pass", value: "Revoked" };
  }
  return { status: "fail", value: context.freezeAuthority };
}
