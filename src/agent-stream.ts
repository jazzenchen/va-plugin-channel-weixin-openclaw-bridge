/**
 * WeChat stream renderer — extends BlockRenderer for WeChat OpenClaw Bridge.
 *
 * WeChat is send-only (no message editing). Uses streaming=false so each
 * block is held until complete, then sent as one message.
 */

import {
  BlockRenderer,
  type BlockKind,
  type ChannelTarget,
  type OutboundFile,
  type VerboseConfig,
} from "@vibearound/plugin-channel-sdk";
import type { WechatOpenClawBridge } from "./wechat-bridge.js";

export class AgentStreamHandler extends BlockRenderer<string> {
  private bridge: WechatOpenClawBridge;

  constructor(bridge: WechatOpenClawBridge, verbose?: Partial<VerboseConfig>) {
    super({
      streaming: false,
      flushIntervalMs: 500,
      verbose,
    });
    this.bridge = bridge;
  }

  protected async sendText(target: ChannelTarget, text: string): Promise<void> {
    await this.bridge.sendSystemText({
      chatId: target.chatId,
      text,
      replyTo: target.replyTo,
    });
  }

  protected async sendFile(
    target: ChannelTarget,
    file: OutboundFile,
  ): Promise<void> {
    await this.bridge.sendMediaFile({
      chatId: target.chatId,
      filePath: file.path,
      fileName: file.name,
    });
  }

  protected async sendBlock(target: ChannelTarget, _kind: BlockKind, content: string): Promise<string | null> {
    await this.bridge.sendSystemText({
      chatId: target.chatId,
      text: content,
      replyTo: target.replyTo,
    });
    return "sent"; // non-null sentinel — prevents duplicate sends
  }

  // No editBlock — WeChat doesn't support message editing
}
