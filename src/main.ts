#!/usr/bin/env node
/**
 * VibeAround WeChat OpenClaw Bridge Plugin — ACP Client
 *
 * Spawned by the Rust host as a child process.
 * Communicates via ACP protocol (JSON-RPC 2.0 over stdio).
 *
 * Plugin = ACP Client, Host = ACP Agent.
 * Plugin sends prompt() with peerId as sessionId (chatId).
 * Host streams back via sessionUpdate notifications.
 */

import { createRequire } from "node:module";

import { runChannelPlugin } from "@vibearound/plugin-channel-sdk";

import { WechatOpenClawBridge } from "./wechat-bridge.js";
import { AgentStreamHandler } from "./agent-stream.js";
import type { WechatOpenClawBridgeConfig } from "./protocol.js";

const packageVersion = (
  createRequire(import.meta.url)("../package.json") as { version: string }
).version;

runChannelPlugin({
  name: "vibearound-weixin-openclaw-bridge",
  version: packageVersion,
  createBot: ({ config, agent, log, cacheDir, channelInstanceId, actorId }) => {
    const bridgeConfig = config as unknown as WechatOpenClawBridgeConfig;
    return new WechatOpenClawBridge(
      bridgeConfig,
      agent,
      log,
      cacheDir,
      channelInstanceId,
      actorId,
    );
  },
  afterCreate: async (bridge, log) => {
    const botInfo = await bridge.probe();
    log("info", `bot probed: ${JSON.stringify(botInfo)}`);
  },
  createRenderer: (bridge, _log, verbose) =>
    new AgentStreamHandler(bridge, verbose),
  healthCheck: async (bridge) => bridge.isHealthy(),
});
