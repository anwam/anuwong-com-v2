import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";
import critters from "astro-critters";
import compress from "astro-compress";

// https://astro.build/config
export default defineConfig({
  site: "https://www.anuwong.com",
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    critters(),
    compress(),
  ],
});
