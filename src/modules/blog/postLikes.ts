type LikeStorage = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<unknown>;
};

function parseCount(value: string | null) {
  const count = value === null ? 0 : Number(value);
  if (!Number.isSafeInteger(count) || count < 0 || value?.trim() === "") {
    throw new Error("Invalid like count");
  }
  return count;
}

export function validVisitor(value: string | undefined) {
  return value && /^[a-zA-Z0-9_-]{1,256}$/.test(value) ? value : null;
}

export async function readPostLikes(
  storage: LikeStorage,
  slug: string,
  visitor: string | null,
) {
  const likes = parseCount(await storage.get(`like:${slug}`));
  const liked = visitor
    ? (await storage.get(`liked:${slug}:${visitor}`)) === "true"
    : false;
  return { slug, likes, liked };
}

export async function likePost(
  storage: LikeStorage,
  slug: string,
  visitor: string,
) {
  const countKey = `like:${slug}`;
  const receiptKey = `liked:${slug}:${visitor}`;
  const intentKey = `like-pending:${slug}:${visitor}`;
  const count = parseCount(await storage.get(countKey));
  const receipt = await storage.get(receiptKey);
  if (receipt === "true") {
    return {
      slug,
      likes: count,
      liked: true,
      message: "You have already liked this page.",
    };
  }

  // Intent and completion use different keys: KV allows one write/key/second.
  // Sequential retries resume the intent; KV still permits concurrent lost updates.
  const intent = await storage.get(intentKey);
  let target = count + 1;
  if (intent !== null) {
    const pending = JSON.parse(intent);
    if (
      pending?.status !== "pending" ||
      !Number.isSafeInteger(pending.count) ||
      pending.count < 1
    ) {
      throw new Error("Invalid like receipt");
    }
    target = Math.max(count, pending.count);
  } else {
    if (!Number.isSafeInteger(target))
      throw new Error("Like count limit reached");
    await storage.put(
      intentKey,
      JSON.stringify({ status: "pending", count: target }),
    );
  }
  if (target > count) await storage.put(countKey, String(target));
  await storage.put(receiptKey, "true");
  return { slug, likes: target, liked: true };
}
