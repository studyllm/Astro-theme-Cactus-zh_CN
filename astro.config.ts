import fs from "node:fs";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import webmanifest from "astro-webmanifest";
import { defineConfig, envField } from "astro/config";
import { expressiveCodeOptions } from "./src/site.config";
import { siteConfig } from "./src/site.config";
import node from "@astrojs/node";

// Remark plugins
import remarkDirective from "remark-directive"; // Handle ::: directives as nodes
import { remarkAdmonitions } from "./src/plugins/remark-admonitions"; // Add admonitions
import { remarkReadingTime } from "./src/plugins/remark-reading-time";
import remarkMath from "remark-math"; // Add LaTeX support
import remarkGemoji from "remark-gemoji"; // Add emoji support

// Rehype plugins
import rehypeExternalLinks from "rehype-external-links";
import rehypeUnwrapImages from "rehype-unwrap-images";
import rehypeKatex from "rehype-katex"; // Render LaTeX with KaTeX


import decapCmsOauth from "astro-decap-cms-oauth";

// https://astro.build/config
export default defineConfig({
  output: 'static', // 🚀 Astro 5.0：默认静态生成，支持按需SSR（通过 export const prerender = false）
  adapter: node({ mode: 'standalone' }), // EdgeOne 兼容的 Node.js 适配器
  
  // 🔧 EdgeOne 部署配置：处理 client/server 分离结构
  outDir: './dist', // 设置输出根目录
  
  // 🌐 服务器配置：确保静态资源正确映射
  server: {
    host: true, // 允许外部访问
  },
    image: {
        domains: ["webmention.io"],
    },
    integrations: [expressiveCode(expressiveCodeOptions), icon({
  iconDir: "public/icons", // 修改：指定自定义图标目录 name = svg文件名
}), tailwind({
        applyBaseStyles: false,
        nesting: true,
		}), sitemap(), mdx(), robotsTxt(), webmanifest({
        // See: https://github.com/alextim/astro-lib/blob/main/packages/astro-webmanifest/README.md
        /**
         * required
         **/
        name: siteConfig.title,
        /**
         * optional
         **/
        short_name: "仙人掌主题",
        description: siteConfig.description,
        lang: siteConfig.lang,
        icon: "public/icon.svg", // the source for generating favicon & icons
        icons: [
            {
                src: "icons/apple-touch-icon.png", // used in src/components/BaseHead.astro L:26
                sizes: "180x180",
                type: "image/png",
            },
            {
                src: "icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "icons/icon-512.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],
        start_url: "/",
        background_color: "#1d1f21",
        theme_color: "#2bbc8a",
        display: "standalone",
        config: {
            insertFaviconLinks: false,
            insertThemeColorMeta: false,
            insertManifestLink: false,
        },
		}), decapCmsOauth()],
    markdown: {
        rehypePlugins: [
            [
                rehypeExternalLinks,
                {
                    rel: ["nofollow, noreferrer"],
                    target: "_blank",
                },
            ],
            rehypeUnwrapImages,
            rehypeKatex, // 添加 KaTeX 用于 LaTeX 渲染
        ],
        remarkPlugins: [
          remarkReadingTime,
          remarkDirective,
          remarkAdmonitions,
          remarkMath, // 添加 LaTeX 功能
          remarkGemoji, // 添加 emoji 功能
        ],
        remarkRehype: {
            footnoteLabelProperties: {
                className: [""],
            },
      footnoteLabel: '脚注：',
        },
    },
    // https://docs.astro.build/en/guides/prefetch/
    prefetch: {
    defaultStrategy: 'viewport',
    prefetchAll: true,
  },
    // ! 改为你的网站地址，不然社交图片无法加载
    site: "https://demo.343700.xyz/",
    vite: {
        optimizeDeps: {
            exclude: ["@resvg/resvg-js"],
        },
        plugins: [rawFonts([".ttf", ".woff"])],
    },
    env: {
        schema: {
            WEBMENTION_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
            WEBMENTION_URL: envField.string({ context: "client", access: "public", optional: true }),
            WEBMENTION_PINGBACK: envField.string({ context: "client", access: "public", optional: true }),
            OAUTH_GITHUB_CLIENT_ID: envField.string({ context: "server", access: "secret", optional: true }),
            OAUTH_GITHUB_CLIENT_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
        },
    },
});

function rawFonts(ext: string[]) {
    return {
        name: "vite-plugin-raw-fonts",
        // @ts-expect-error:next-line
        transform(_, id) {
            if (ext.some((e) => id.endsWith(e))) {
                const buffer = fs.readFileSync(id);
                return {
                    code: `export default ${JSON.stringify(buffer)}`,
                    map: null,
                };
            }
        },
    };
}
