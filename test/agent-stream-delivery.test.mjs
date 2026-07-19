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

test("Weixin turn completion exposes final delivery failure", async () => {
  const renderer = createRenderer(async () => {
    throw new Error("Weixin final delivery failed");
  });

  renderer.onPromptSent(target);
  renderer.onSessionUpdate(target, {
    sessionId: "session",
    update: {
      sessionUpdate: "agent_message_chunk",
      content: { type: "text", text: "final response" },
      messageId: "message-final",
    },
  });

  await assert.rejects(
    renderer.onTurnEnd(target),
    /Weixin final delivery failed/,
  );
});
