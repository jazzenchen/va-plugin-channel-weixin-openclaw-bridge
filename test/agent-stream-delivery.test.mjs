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

function createRenderer(sendSystemText, sendMediaFile = async () => {}) {
  return new AgentStreamHandler({ sendSystemText, sendMediaFile });
}

test("Weixin transport failure rejects block delivery", async () => {
  const failure = new Error("Weixin send failed");
  const renderer = createRenderer(async () => { throw failure; });

  await assert.rejects(
    renderer.sendBlock(target, "text", "answer"),
    failure,
  );
});

test("Weixin forwards workspace files with their resource name", async () => {
  const sent = [];
  const renderer = createRenderer(async () => {}, async (file) => sent.push(file));

  await renderer.sendFile(target, {
    path: "/workspace/generated.bin",
    name: "report.pdf",
  });

  assert.deepEqual(sent, [{
    chatId: "peer-1",
    filePath: "/workspace/generated.bin",
    fileName: "report.pdf",
  }]);
});
