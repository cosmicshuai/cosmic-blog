import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import eleventyImage from "@11ty/eleventy-img";
import pluginRss from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItAnchor from "markdown-it-anchor";
import markdownItTOC from "markdown-it-table-of-contents";

// Image shortcode for optimization
async function imageShortcode(src, alt, sizes = "100vw", classes = "") {
  if (alt === undefined) {
    throw new Error(`Missing \`alt\` on image from: ${src}`);
  }

  let metadata = await eleventyImage(src, {
    widths: [400, 800, 1200, 1600],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/",
    urlPath: "/img/",
  });

  let imageAttributes = {
    alt,
    sizes,
    class: classes,
    loading: "lazy",
    decoding: "async",
  };

  return eleventyImage.generateHTML(metadata, imageAttributes);
}

// Gallery image shortcode
async function galleryImageShortcode(src, alt, sizes = "100vw", classes = "") {
  if (alt === undefined) {
    throw new Error(`Missing \`alt\` on image from: ${src}`);
  }

  let metadata = await eleventyImage(src, {
    widths: [300, 600],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/",
    urlPath: "/img/",
  });

  let imageAttributes = {
    alt,
    sizes,
    class: classes,
    loading: "lazy",
    decoding: "async",
  };

  return eleventyImage.generateHTML(metadata, imageAttributes);
}

export default function (eleventyConfig) {
  // Plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(syntaxHighlight);

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("./src/styles/output.css");
  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/assets/photos");

  // Watch targets
  eleventyConfig.addWatchTarget("./src/styles/");

  // Image shortcode
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  eleventyConfig.addNunjucksAsyncShortcode("galleryImage", galleryImageShortcode);
  eleventyConfig.addLiquidShortcode("galleryImage", galleryImageShortcode);
  eleventyConfig.addJavaScriptFunction("galleryImage", galleryImageShortcode);

  // Date filters
  // UTC-pinned: front matter dates are calendar dates, not instants, so the
  // rendered day must not shift with the build machine's timezone.
  eleventyConfig.addFilter("readableDate", (dateObj) => {
    return new Date(dateObj).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return new Date(dateObj).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("dateYear", (dateObj) => {
    return new Date(dateObj).getFullYear();
  });

  eleventyConfig.addFilter("dateMonth", (dateObj) => {
    return String(new Date(dateObj).getMonth() + 1).padStart(2, "0");
  });

  eleventyConfig.addFilter("isValidTagSlug", (tag) => {
    const slug = String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return slug && slug !== "tags";
  });

  eleventyConfig.addFilter("slugifySafe", (tag) => {
    const slug = String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return slug && slug !== "tags" ? slug : "";
  });

  eleventyConfig.addFilter("getValidTagList", (tagList) => {
    return tagList.filter((tag) => {
      const slug = String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      return slug && slug !== "tags";
    });
  });

  // Collection: Posts (sorted by date, reverse chronological)
  eleventyConfig.addCollection("posts", (collection) => {
    return collection.getFilteredByGlob("./src/posts/*.md").sort((a, b) => {
      return b.date - a.date;
    });
  });

  // Collection: Tags
  eleventyConfig.addCollection("tagList", (collection) => {
    const tagsSet = new Set();
    collection.getAll().forEach((item) => {
      if ("tags" in item.data) {
        let tags = item.data.tags;
        if (typeof tags === "string") {
          tags = [tags];
        }
        tags = tags.filter((tag) => !["posts", "all", "tags"].includes(tag));
        for (const tag of tags) {
          tagsSet.add(tag);
        }
      }
    });
    return Array.from(tagsSet).sort();
  });

  eleventyConfig.addCollection("validTagList", (collection) => {
    const tagsSet = new Set();
    collection.getAll().forEach((item) => {
      if ("tags" in item.data) {
        let tags = item.data.tags;
        if (typeof tags === "string") {
          tags = [tags];
        }
        tags = tags.filter((tag) => !["posts", "all", "tags"].includes(tag));
        for (const tag of tags) {
          const slug = String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
          if (slug && slug !== "tags") {
            tagsSet.add(tag);
          }
        }
      }
    });
    return Array.from(tagsSet).sort();
  });

  // Get posts by tag
  eleventyConfig.addFilter("getByTag", (collection, tag) => {
    if (!tag) return collection;
    return collection.filter((item) => {
      const tags = item.data.tags || [];
      return tags.includes(tag);
    });
  });

  // Limit filter for pagination
  eleventyConfig.addFilter("limit", (array, limit) => {
    return array.slice(0, limit);
  });

  // Word count — strips tags so markup doesn't inflate the number.
  const countWords = (content) => {
    if (typeof content !== "string" || !content.trim()) return 0;
    return content
      .replace(/<[^>]+>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
  };

  eleventyConfig.addFilter("wordCount", countWords);

  // Reading time filter
  eleventyConfig.addFilter("readingTime", (content) => {
    return Math.max(1, Math.ceil(countWords(content) / 200));
  });

  // Head filter (for excerpts)
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }
    return array.slice(0, n);
  });

  // Markdown configuration with TOC and anchor links
  eleventyConfig.amendLibrary("md", (mdLib) => {
    mdLib.use(markdownItAnchor, {
      permalink: markdownItAnchor.permalink.ariaHidden({
        placement: "after",
        class: "anchor-link",
        symbol: "#",
        ariaLabel: "Permalink to this heading",
        wrapper: ['<span class="heading-wrapper">', "</span>"],
      }),
      slugify: (s) =>
        encodeURIComponent(
          String(s)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, "-")
        ),
    });

    mdLib.use(markdownItTOC, {
      includeLevel: [2, 3, 4],
      containerClass: "toc",
      containerHeaderHtml: '<h2 class="toc-title">Table of Contents</h2>',
      listType: "ul",
      linkClass: "toc-link",
    });
  });

  // Date-based permalinks for posts
  eleventyConfig.addPreprocessor("date-permalink", "md", (data) => {
    if (data.tags && data.tags.includes("posts") && data.date) {
      const date = new Date(data.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const slug = data.page.fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
      data.permalink = `/${year}/${month}/${slug}/`;
    }
  });

  
  // Transform to add data-language and copy button to code blocks
  eleventyConfig.addTransform("code-blocks", function(content) {
    if (typeof content === "string") {
      return content.replace(/<pre class="language-([^"]+)">/g, '<pre class="language-$1" data-language="$1"><button class="copy-btn" aria-label="Copy code">Copy</button>');
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",
  };
}
