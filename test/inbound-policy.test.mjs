import test from "node:test";
import assert from "node:assert/strict";

import { shouldHandleInboundMessage } from "../dist/messaging/inbound.js";

test("direct Weixin messages remain eligible for channel routing", () => {
  assert.equal(
    shouldHandleInboundMessage({ from_user_id: "user-a" }),
    true,
  );
});

test("Weixin group messages fail closed until mention routing is supported", () => {
  assert.equal(
    shouldHandleInboundMessage({
      from_user_id: "user-a",
      group_id: "group-a",
    }),
    false,
  );
  assert.equal(
    shouldHandleInboundMessage({
      from_user_id: "user-a",
      group_id: "",
    }),
    false,
  );
});
