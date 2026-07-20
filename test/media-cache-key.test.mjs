import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { downloadMediaItem } from "../dist/media/media-download.js";

test("media items without msg_id use distinct parent-scoped cache keys", async (t) => {
  const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), "weixin-media-cache-"));
  t.after(() => fs.rm(cacheDir, { recursive: true, force: true }));

  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let request = 0;
  globalThis.fetch = async () => new Response(Buffer.from(`image-${request++}`));

  const item = {
    type: 2,
    image_item: { media: { full_url: "https://example.test/image" } },
  };
  const common = {
    item,
    cdnBaseUrl: "https://example.test",
    cacheDir,
    channelKind: "weixin",
    chatId: "peer-1",
    messageId: "parent-1",
    label: "test",
  };

  const first = await downloadMediaItem({ ...common, itemIndex: 0 });
  const second = await downloadMediaItem({ ...common, itemIndex: 1 });

  assert.notEqual(first?.path, second?.path);
  assert.equal(await fs.readFile(first.path, "utf8"), "image-0");
  assert.equal(await fs.readFile(second.path, "utf8"), "image-1");
});
