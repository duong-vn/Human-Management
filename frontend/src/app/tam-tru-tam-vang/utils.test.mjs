import assert from "node:assert/strict";
import { getDaysRemaining, isExpiringSoon } from "./utils.ts";

const now = new Date("2026-09-21T12:00:00Z");

assert.equal(isExpiringSoon("2026-09-26T12:00:00Z", now), true, "5 days remaining should be expiring soon");
assert.equal(isExpiringSoon("2026-10-06T12:00:00Z", now), true, "15 days remaining should be expiring soon");
assert.equal(isExpiringSoon("2026-09-21T12:00:00Z", now), true, "0 days remaining should be expiring soon");
assert.equal(isExpiringSoon("2026-10-07T13:00:00Z", now), false, "16 days remaining should not be expiring soon");
assert.equal(isExpiringSoon("2026-09-20T12:00:00Z", now), false, "Past date should not be expiring soon");
assert.equal(isExpiringSoon(null, now), false, "null should return false");
assert.equal(isExpiringSoon(undefined, now), false, "undefined should return false");
assert.equal(isExpiringSoon("invalid-date", now), false, "invalid date string should return false");
assert.equal(getDaysRemaining("2026-09-26T12:00:00Z", now), 5);
assert.equal(getDaysRemaining(null, now), null);

console.log("All date predicate tests passed successfully!");
