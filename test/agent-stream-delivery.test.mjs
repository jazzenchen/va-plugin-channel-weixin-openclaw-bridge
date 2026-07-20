import assert from "node:assert/strict";
import test from "node:test";

import { AgentStreamHandler } from "../dist/agent-stream.js";

const target = {
  channelInstanceId: "weixin-primary",
  actorId: "weixin-bot",
  chatId: "peer-1",
  topicId: undefined,
  replyTo: "message-1",
};

function createRenderer(sendSystemText) {
  return new AgentStreamHandler({ sendSystemText });
}

test("Weixin transport failure rejects block delivery", async () => {
  const failure = new Error("Weixin send failed");
  const renderer = createRenderer(async () => { throw failure; });

  await assert.rejects(
    renderer.sendBlock(target, "text", "answer"),
    failure,
  );
});
