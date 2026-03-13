import { defineConfig } from "vitepress";

export default defineConfig({
  title: "tablsx",
  description: "Lightweight Node.js utilities for reading and writing .xlsx files.",
  cleanUrls: true,
  themeConfig: {
    logo: { text: "tablsx" },
    nav: [
      { text: "Guide", link: "/guide/getting-started" },
      { text: "Reference", link: "/reference/" },
      { text: "Docs Process", link: "/documentation/docs-maintenance" },
    ],
    search: {
      provider: "local",
    },
    sidebar: {
      "/guide/": [
        {
          text: "Guide",
          items: [
            { text: "Getting Started", link: "/guide/getting-started" },
            { text: "Reading Workbooks", link: "/guide/reading-workbooks" },
            { text: "Writing Workbooks", link: "/guide/writing-workbooks" },
            { text: "Tabular Workflows", link: "/guide/tabular-workflows" },
            { text: "Builder API", link: "/guide/builder-api" },
            {
              text: "Data Types and Limits",
              link: "/guide/data-types-and-limits",
            },
          ],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [
            { text: "Overview", link: "/reference/" },
            { text: "Core API", link: "/reference/core-api" },
            { text: "Tabular API", link: "/reference/tabular-api" },
            { text: "Builders", link: "/reference/builders" },
            { text: "Readers", link: "/reference/readers" },
            { text: "Utilities", link: "/reference/utilities" },
          ],
        },
      ],
      "/documentation/": [
        {
          text: "Documentation",
          items: [
            {
              text: "Professional Docs Plan",
              link: "/documentation/professional-documentation-plan",
            },
            {
              text: "Docs Maintenance",
              link: "/documentation/docs-maintenance",
            },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/silverstone-i/tablsx" },
    ],
    footer: {
      message: "Built for predictable XLSX data interchange.",
      copyright: "Copyright 2026 NapSoft LLC",
    },
  },
});
