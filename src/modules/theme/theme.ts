// This module is intentionally valid JavaScript: BaseLayout embeds the same
// source inline so preference is applied before paint without a second owner.
(() => {
  if (Reflect.get(window, "__anuwongThemeInitialized")) return;
  Object.defineProperty(window, "__anuwongThemeInitialized", { value: true });

  const readPreference = () => {
    try {
      const saved = localStorage.getItem("theme");
      return saved === "dark" || saved === "light" ? saved : null;
    } catch {
      return null;
    }
  };
  let preference = readPreference();
  const system = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => {
    const dark = (preference ?? (system.matches ? "dark" : "light")) === "dark";
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    document
      .getElementById("theme-toggle")
      ?.setAttribute("aria-pressed", String(dark));
  };

  document.addEventListener("click", (event) => {
    if (
      !(event.target instanceof Element) ||
      !event.target.closest("#theme-toggle")
    )
      return;
    preference = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";
    try {
      localStorage.setItem("theme", preference);
    } catch {
      /* Keep the choice for this document's lifetime. */
    }
    apply();
  });
  document.addEventListener("astro:after-swap", apply);
  document.addEventListener("astro:page-load", apply);
  system.addEventListener("change", apply);
  window.addEventListener("storage", (event) => {
    if (event.key === "theme" || event.key === null) {
      preference = readPreference();
      apply();
    }
  });
  apply();
})();
