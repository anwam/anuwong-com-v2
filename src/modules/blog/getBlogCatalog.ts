import { getCollection } from "astro:content";
import { createBlogCatalog } from "./catalog";

export async function getBlogCatalog() {
  return createBlogCatalog(await getCollection("blog"));
}
