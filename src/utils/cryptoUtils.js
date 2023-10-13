import crypto from "crypto";
export function sha256(data) {
  const hashFn = crypto.createHash("sha256");
  hashFn.update(data);
  return hashFn.digest("hex");
}
