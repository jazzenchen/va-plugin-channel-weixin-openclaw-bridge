import assert from "node:assert/strict";
import test from "node:test";

import { WechatOpenClawBridge } from "../dist/wechat-bridge.js";

test("start is unhealthy until the first successful long poll", () => {
  const bridge = new WechatOpenClawBridge(
    { bot_token: "token", account_id: "account" },
    {},
    () => {},
    "/tmp",
    "weixin:account",
    "weixin:account",
  );
  bridge.lastSuccessfulPollAt = Date.now();
  bridge.pollLoop = async () => {};

  bridge.start();

  assert.equal(bridge.lastSuccessfulPollAt, 0);
  assert.equal(bridge.isHealthy(), false);
});
