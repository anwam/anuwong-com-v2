let visitorPromise: Promise<string> | undefined;

function savedVisitor() {
  try {
    const saved = localStorage.getItem("likes-visitor-id");
    if (saved && /^[a-zA-Z0-9_-]{1,256}$/.test(saved)) return saved;
  } catch {
    /* Storage can be blocked; the module retains this visitor for the session. */
  }
  return null;
}

function rememberVisitor(visitor: string) {
  try {
    localStorage.setItem("likes-visitor-id", visitor);
  } catch {
    /* Keep the session identity. */
  }
  return visitor;
}

function fallbackVisitor() {
  return savedVisitor() ?? rememberVisitor(crypto.randomUUID());
}

function getVisitor() {
  return (visitorPromise ??= (async () => {
    const saved = savedVisitor();
    if (saved) return saved;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const fingerprint = (async () => {
        const { default: FingerprintJS } =
          await import("@fingerprintjs/fingerprintjs");
        const agent = await FingerprintJS.load();
        return (await agent.get()).visitorId;
      })().catch(() => null);
      const visitor = await Promise.race([
        fingerprint,
        new Promise<null>((resolve) => {
          timer = setTimeout(() => resolve(null), 1500);
        }),
      ]);
      return visitor && /^[a-zA-Z0-9_-]{1,256}$/.test(visitor)
        ? rememberVisitor(visitor)
        : fallbackVisitor();
    } finally {
      clearTimeout(timer);
    }
  })());
}

async function readResult(response: Response) {
  if (!response.ok) throw new Error("Like request failed");
  const result: unknown = await response.json();
  if (
    typeof result !== "object" ||
    result === null ||
    !("likes" in result) ||
    !("liked" in result) ||
    typeof result.likes !== "number" ||
    !Number.isSafeInteger(result.likes) ||
    result.likes < 0 ||
    typeof result.liked !== "boolean"
  ) {
    throw new Error("Invalid like response");
  }
  return { likes: result.likes, liked: result.liked };
}

let initialized = false;

export function initializeLikes() {
  if (initialized) return;
  initialized = true;
  let mounted: HTMLButtonElement | null = null;
  let dispose = () => {};

  const mount = () => {
    const button = document.querySelector<HTMLButtonElement>("#like-button");
    if (button && button === mounted) return;
    dispose();
    mounted = button;
    const count = document.getElementById("like-count");
    const status = document.getElementById("like-status");
    const slug = button?.dataset.slug;
    if (!button || !count || !status || !slug) return;
    const lifetime = new AbortController();
    dispose = () => {
      lifetime.abort();
      mounted = null;
    };
    const { signal } = lifetime;
    let visitor: string;
    let ready = false;
    let liked = false;
    let pending = false;
    button.disabled = true;
    const message = (text: string) => {
      status.textContent = text;
      status.hidden = !text;
    };
    const render = (result: { likes: number; liked: boolean }) => {
      count.textContent = String(result.likes);
      liked = result.liked;
      button.setAttribute("aria-pressed", String(liked));
      button.disabled = liked;
    };
    void (async () => {
      try {
        visitor = await getVisitor();
        if (signal.aborted) return;
        ready = true;
        const result = await readResult(
          await fetch(`/api/pages/${encodeURIComponent(slug)}/likes`, {
            headers: { "X-Visitor-Id": visitor },
            signal,
          }),
        );
        if (!signal.aborted) render(result);
      } catch {
        if (!signal.aborted) {
          message("Couldn't load likes. Please try again.");
          button.disabled = !ready;
        }
      }
    })();

    button.addEventListener(
      "click",
      async () => {
        if (!ready || pending || liked || button.disabled) return;
        pending = true;
        button.disabled = true;
        message("");
        try {
          const result = await readResult(
            await fetch(`/api/pages/${encodeURIComponent(slug)}/likes`, {
              method: "PUT",
              headers: { "X-Visitor-Id": visitor },
              signal,
            }),
          );
          if (!result.liked) throw new Error("Like was not saved");
          if (!signal.aborted) {
            render(result);
            message("Thank you for liking this post!");
          }
        } catch {
          if (!signal.aborted)
            message("Couldn't save your like. Please try again.");
        } finally {
          pending = false;
          if (!signal.aborted) button.disabled = liked;
        }
      },
      { signal },
    );
  };
  document.addEventListener("astro:before-swap", () => dispose());
  document.addEventListener("astro:page-load", mount);
  mount();
}
