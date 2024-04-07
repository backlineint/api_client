import starlight from "@astrojs/starlight";
import liveCode from "astro-live-code";
import { defineConfig } from "astro/config";
import starlightTypeDoc, { typeDocSidebarGroup } from "starlight-typedoc";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  base: "/api_client",
  integrations: [
    liveCode(),
    starlight({
      plugins: [
        starlightTypeDoc({
          entryPoints: ["../packages/*"],
          output: "api",
          tsconfig: "../tsconfig.json",
          sidebar: {
            label: "API Reference",
            collapsed: true,
          },
          typeDoc: {
            entryPointStrategy: "packages",
            plugin: ["typedoc-plugin-mdn-links"],
            useCodeBlocks: true,
            navigationLinks: {
              "Project Page": "https://www.drupal.org/project/api_client",
            },
          },
        }),
      ],
      title: "Drupal API Client",
      customCss: ["./src/styles/custom.css"],
      social: {
        gitlab: "https://git.drupalcode.org/project/api_client",
        openCollective: "https://opencollective.com/drupal-api-client",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            // Each item here is one entry in the navigation menu.
            {
              label: "Introduction",
              link: "/",
            },
            {
              label: "Quick Start",
              link: "/getting-started/quick-start/",
            },
            {
              label: "Interactive Playground",
              link: "/getting-started/interactive-playground/",
            },
          ],
        },
        {
          label: "JSON:API Client Tutorial",
          collapsed: true,
          items: [
            {
              label: "About this Tutorial",
              link: "/jsonapi-tutorial/about/",
            },
            {
              label: "Creating a List of Recipes",
              link: "/jsonapi-tutorial/recipes-list/",
            },
            {
              label: "Using JSON:API Parameters",
              link: "/jsonapi-tutorial/parameters/",
            },
            {
              label: "Deserializing Data",
              link: "/jsonapi-tutorial/deserializing-data/",
            },
            {
              label: "Handling Translated Content",
              link: "/jsonapi-tutorial/translated-content/",
            },
            {
              label: "Working With an Individual Recipe",
              link: "/jsonapi-tutorial/individual-recipe/",
            },
            {
              label: "Using Authentication",
              link: "/jsonapi-tutorial/authentication/",
            },
          ],
        },
        {
          label: "Using With Frameworks",
          collapsed: true,
          items: [
            {
              label: "Overview",
              link: "/with-frameworks/overview/",
            },
            {
              label: "React",
              link: "/with-frameworks/react/",
            },
            {
              label: "Drupal",
              link: "/with-frameworks/drupal/",
            },
            {
              label: "Astro",
              link: "/with-frameworks/astro/",
            },
          ],
        },
        typeDocSidebarGroup,
      ],
    }),
    react(),
  ],
});
