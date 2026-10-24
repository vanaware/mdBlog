> **AI INSTRUCTION:** 
> The text below contains the utility code used in the @vanaware/mdblog project, such as build scripts and CI/CD configuration.
> Each file starts with a title indicating its exact relative path (e.g., `## File: src/main.ts`).
> Whenever suggesting changes, clearly indicate which file should be modified based on these paths and provide the complete new code for the file.

---

# Exported Context from Project mdBlog [v0.2.3#mvmwaqyg] - Mode: UTILS

Automatically generated at: 2026-10-24T21:39:28.521Z

---

## File: `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  check-all:
    name: Test, Lint & Format Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
          cache: true

      - name: Run tests
        run: deno test -P

      - name: Lint code
        run: deno lint

      - name: Check formatting
        run: deno fmt --check

```

---

## File: `.github/workflows/jsr-publish.yml`

```yaml
name: Publish to JSR

on:
  push:
    tags:
      - "v*.*"
  workflow_dispatch:

permissions:
  contents: read
  id-token: write

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
          cache: true

      - name: Install dependencies
        run: deno ci

      - name: Verify code integrity
        run: deno task tests

      - name: Sanitize Version
        run: |
          deno task sanitize-version ./packages/mdblog/deno.jsonc

      - name: Publish mdBlog to JSR
        run: |
          cd packages/mdblog
          deno publish --allow-slow-types --allow-dirty

```

---

## File: `.github/workflows/pages.yml`

```yaml
name: Deploy Example to GitHub Pages

on:
  push:
    tags:
      - "v*.*"
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Deno
        uses: denoland/setup-deno@v2
        with:
          deno-version-file: .tool-versions
          cache: true

      - name: Install dependencies
        run: deno ci

      - name: Verify code integrity
        run: deno task tests

      - name: Build Application
        # No "noversion": the stamp ("version#buildHash") is written into the
        # bundle, and the client registers the worker as
        # "sw.js?version=<stamp>". A worker is only replaced when its script URL
        # or bytes change, so a deploy that keeps the previous stamp would leave
        # every returning visitor running the shell and the engine of the build
        # before it — the stale copy that answers with a page which never
        # finishes loading. Bumping here gives each deploy its own URL, and each
        # visitor one clean update.
        run: deno task esbuild

      - name: Prepare static assets for GitHub Pages
        run: |
          # Disable Jekyll processing on GitHub Pages
          touch ./packages/server/build/dist/.nojekyll
          # Copy index.html to 404.html for SPA subfolder route fallback
          cp ./packages/server/build/dist/index.html ./packages/server/build/dist/404.html

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: "./packages/server/build/dist"

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

```

---

## File: `README.md`

````md
# mdBlog 📖⚡

> Modern, zero-build, offline-first Browser Blog & Documentation Engine powered by Deno, Service Worker, Wire Format AST, Preact Signals, and BeerCSS (Material Design 3).

[![JSR](https://jsr.io/badges/@vanaware/mdblog)](https://jsr.io/@vanaware/mdblog)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deno 2.x](https://img.shields.io/badge/Deno-2.x-000000?logo=deno&logoColor=white)](https://deno.com)

---

## 🌟 Highlights

- **⚡ Offline-First PWA:** Intercepts documentation requests (`/articles/*.md`) in a Service Worker, parsing Markdown directly in background and serving instantly from cache.
- **🛡️ Secure Wire Format AST:** Converts Markdown (CommonMark + GFM) into a pure, JSON-serializable Intermediate Representation (`WireDoc`). Zero raw HTML output, zero `dangerouslySetInnerHTML`, and complete immunity to XSS injection.
- **🏝️ Zero-Bundle Dynamic Islands:** Interactive components written in pure **HTML+ES** (`htm/preact`) loaded dynamically on demand directly by the browser (`import("./islands/Component.js")`). Zero compilation step required for new widgets.
- **🎨 Pure BeerCSS UI:** Elegant Material Design 3 interface styled with BeerCSS semantic classes. Automatic dark/light theme toggle, mobile drawer sidebar, and responsive layout.
- **🔍 Frontmatter & Full-Text Search:** Automatically discovers pages, sub-pages, and breadcrumbs from YAML frontmatter in `index.md`, indexing contents in IndexedDB for instant client-side search.
- **🦕 100% Pure Deno:** No Node.js runtime, no `node_modules` pollution, and zero heavy bundler toolchains for authoring. Published to [JSR as `@vanaware/mdblog`](https://jsr.io/@vanaware/mdblog).

---

## 🚀 Quick Start

### 1. Requirements

- [Deno 2.x](https://deno.land/) installed.

### 2. Clone and Run Locally

```bash
# Clone the repository
git clone https://github.com/vanaware/mdBlog.git
cd mdBlog

# Start the local development server (port 3000)
deno task dev
```

Open your browser at `http://localhost:3000`.

### 3. Build & Distribution

```bash
# Bundle packages/mdblog into packages/server/build/dist and packages/mdblog/dist
deno task esbuild

# Run test suite
deno task test

# Run documentation linter (JSR compliance)
deno task --cwd packages/mdblog lint:doc
```

---

## 📁 Repository Structure

```
├── packages/
│   ├── mdblog/                   # Core blog engine & JSR package (@vanaware/mdblog)
│   │   ├── public/               # Static PWA assets & demo content
│   │   │   ├── articles/         # Markdown documentation articles
│   │   │   │   └── index.md      # Root article with frontmatter navigation tree
│   │   │   ├── islands/          # Interactive HTML+ES island components
│   │   │   │   ├── Counter.js    # Interactive counter island demo
│   │   │   │   └── DemoWidget.js # Dynamic widget island demo
│   │   │   ├── index.html        # Single-page application entry point
│   │   │   ├── manifest.json     # PWA Web App Manifest
│   │   │   └── sw.js             # Service Worker interceptor
│   │   ├── src/                  # Library source code
│   │   │   ├── components/       # BeerCSS UI components (Navbar, Sidebar, Content...)
│   │   │   ├── plugin/           # Markdown parsing & Wire AST pipeline
│   │   │   ├── render/           # Preact VNode materialization & island hydrator
│   │   │   ├── router.ts         # Hash-based SPA router
│   │   │   ├── state.ts          # Centralized Preact Signals store
│   │   │   └── mod.ts            # Public entrypoint for JSR and browser bundle
│   │   └── tests/                # BDD test suites (@std/testing/bdd)
│   └── server/                   # Native Deno file server (port 3000)
├── docs/                         # Architecture, API references, and guides
│   ├── README.md                 # Documentation index and reading order
│   ├── guide.md                  # Hands-on guide with a live island demo
│   ├── api-reference.md          # Comprehensive TypeScript API reference
│   ├── syntax-and-islands.md     # Markdown, GFM, and Islands syntax guide
│   ├── wire-format.md            # Wire Format JSON AST specification
│   ├── flows.md                  # Service Worker lifecycle and cache strategy
│   ├── islands.md                # Selective hydration and island lifecycle
│   └── publish-jsr-rules.md      # Installation, configuration, and JSR guide
└── deno.jsonc                    # Deno workspace & tasks configuration
```

---

## ✍️ Writing Articles

Place your markdown files in `public/articles/`. Define navigation and hierarchy in the YAML frontmatter of `public/articles/index.md`:

```markdown
---
title: "My Documentation"
pages:
  - path: "getting-started.md"
    title: "Getting Started"
    icon: "rocket_launch"
  - path: "advanced.md"
    title: "Advanced Guides"
    icon: "tune"
---

# Welcome to mdBlog

Start writing standard CommonMark or GitHub Flavored Markdown (GFM).
```

### Embedding Interactive Islands

Use either code blocks or directive syntax:

```markdown
<!-- Directive syntax -->
::Counter.js{start: 5, step: 2}

<!-- Code block syntax -->
```island:Counter.js
{ "start": 10, "step": 5 }
```
```

Islands live in `public/islands/` and run natively in the browser without bundling!

---

## 🧪 Testing and Verification

Run the full automated test suite and type checks:

```bash
# Run tests with permissions
deno task test

# Run documentation linting
deno task --cwd packages/mdblog lint:doc

# Check code formatting
deno fmt --check
```

---

## 📄 License

MIT © [Vanaware](https://github.com/vanaware)

````

---

## File: `deno.jsonc`

```json
{
  "version": "0.2.3#mvmwaqyg",
  "description": "Browser Blog engine from markdown.",
  "license": "MIT",
  "author": "Vanaware",
  "repository": {
    "type": "git",
    "url": "https://github.com/vanaware/mdBlog"
  },
  "workspace": [
    "./packages/mdblog",
    "./packages/server"
  ],
  "compilerOptions": {
    "lib": [
      "deno.ns",
      "esnext"
    ],
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true
  },
  "nodeModulesDir": "auto",
  "minimumDependencyAge": 5,
  "vendor": true,
  "unstable": [
    "bundle"
  ],
  "exclude": [
    ".qwen/",
    ".vscode/",
    ".github/",
    "packages/server/build/",
    "vendor",
    "node_modules",
    "snapshots",
    "docs"
  ],
  "catalog": {
    "esbuild": "^0.28.2"
  },
  "allowScripts": [
    "npm:esbuild@0.28.2"
  ],
  "imports": {
    "@std/assert": "jsr:@std/assert@^1.0.19",
    "@std/path": "jsr:@std/path@^1.1.6",
    "@std/testing": "jsr:@std/testing@^1.0.20",
    "@vanaware/buildit": "jsr:@vanaware/buildit@^0.6.1"
  },
  "tasks": {
    "test": "deno test --no-check -P",
    "lint": "deno lint",
    "fmt": "deno fmt",
    "check:all": "deno task --members check && deno check scripts/**/*.ts",
    "fmt:check": "deno fmt --check",
    "lint:fix": "deno lint --fix",
    "lint:doc:all": "deno task --members lint:doc",
    "tests": "deno task check:all && deno task lint && deno task fmt:check && deno task lint:doc:all && deno task test",
    "dev": "deno task --cwd packages/server dev",
    "start": "deno task --cwd packages/server start",
    "export": "deno run --allow-read --allow-write ./scripts/export.ts",
    "esbuild": "deno run -A ./scripts/esbuild.ts",
    "denobuild": "deno run --unstable-bundle -A ./scripts/denobuild.ts",
    "watch": "deno run -A ./scripts/watch.ts",
    "sanitize-version": "deno run -A ./scripts/sanitize-version.ts",
    "tag-version": "deno run -A ./scripts/tag-version.ts",
    "bump": "deno install --frozen=false && deno task esbuild noversion && deno task tag-version"
  },
  "lint": {
    "rules": {
      "tags": [
        "recommended"
      ],
      "include": [
        "ban-untagged-todo"
      ],
      "exclude": [
        "no-unused-vars"
      ]
    },
    "include": [
      "scripts/**/*.ts",
      "packages/**/src/**/*.{ts,tsx}",
      "packages/**/tests/**/*test.ts"
    ]
  },
  "test": {
    "permissions": {
      "read": true,
      "write": true,
      "net": true,
      "env": true,
      "sys": true,
      "run": true,
      "ffi": true,
      "import": true
    },
    "include": [
      "packages/**/tests/**/*test.ts"
    ],
    "exclude": [
      "packages/server/build/",
      "scripts/**/*.ts",
      "packages/**/src/**/*.{ts,tsx}"
    ]
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 80,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false,
    "proseWrap": "preserve",
    "trailingCommas": "always",
    "json.trailingCommas": "never",
    "operatorPosition": "maintain",
    "jsx.bracketPosition": "sameLine",
    "jsx.forceNewLinesSurroundingContent": true,
    "jsx.multiLineParens": "always",
    "newLineKind": "lf",
    "include": [
      "scripts/**/*.ts",
      "packages/**/src/**/*.{ts,tsx}",
      "packages/**/tests/**/*test.ts"
    ],
    "exclude": [
      "packages/server/build/"
    ]
  }
}
```

---

## File: `scripts/denobuild.jsonc`

```json
{
  "$schema": "https://vanaware.github.io/buildit/schema/denobuild.json",
  "versionPaths": [
    "packages/mdblog/public/version.js",
    "packages/mdblog/src/version.ts"
  ],
  "forcepackagesversion": true,
  "targets": {
    "mdblog": {
      "default": true,
      "srcdir": "packages/mdblog/src",
      "distdir": "packages/server/build/dist",
      "clean": {
        "includes": ["*"]
      },
      "copyFiles": [
        {
          "basedir": "packages/mdblog/public"
        }
      ],
      "entryPoints": ["mod.ts"],
      "outfile": "mdblog.js",
      "platform": "browser",
      "format": "esm",
      "minify": false,
      "sourcemap": "linked",
      "keepNames": true,
      "codeSplitting": false,
      "packages": "bundle",
      "inlineImports": true
    },
    "dist": {
      "default": true,
      "srcdir": "packages/mdblog/src",
      "distdir": "packages/mdblog/dist",
      "clean": {
        "includes": ["*"]
      },
      "entryPoints": ["mod.ts"],
      "outfile": "mdblog.min.js",
      "platform": "browser",
      "format": "esm",
      "minify": true,
      "sourcemap": "external",
      "keepNames": true,
      "codeSplitting": false,
      "packages": "bundle",
      "inlineImports": true
    }
  }
}

```

---

## File: `scripts/denobuild.ts`

```ts
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

/**
 * @file build.ts
 * @description CLI of the build orchestrator based on Deno.bundle (denobuild).
 * Delegates execution to the @vanaware/buildit library
 * and loads the declarative configuration from denobuild.jsonc.
 */

import { denoBuildCli, } from "@vanaware/buildit/cli/denobuild";

if (import.meta.main) {
  const cli = denoBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/esbuild.jsonc`

```json
{
  "$schema": "https://vanaware.github.io/buildit/schema/esbuild.json",
  "versionPaths": [
    "packages/mdblog/public/version.js",
    "packages/mdblog/src/version.ts"
  ],
  "forcepackagesversion": true,
  "targets": {
    "mdblog": {
      "default": true,
      "srcdir": "packages/mdblog/src",
      "distdir": "packages/server/build/dist",
      "clean": {
        "includes": ["*"]
      },
      "copyFiles": [
        {
          "basedir": "packages/mdblog/public"
        }
      ],
      "entryPoints": ["mod.ts"],
      "outfile": "mdblog.js",
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": false,
      "sourcemap": "linked",
      "drop": ["debugger"],
      // "worker" on top of "browser": the SAME bundle is imported by the Service
      // Worker (packages/mdblog/public/sw.js). With the "browser" condition alone, the
      // export map of the "decode-named-character-reference" package resolves to
      // index.dom.js, which calls document.createElement at the top of the module and
      // makes the SW script evaluation fail ("ServiceWorker script evaluation failed").
      // Precedence follows the order of the package.json keys, where "worker" comes
      // before "browser", and no other dependency has a "worker" condition, so the
      // browser code stays untouched.
      "conditions": ["browser", "worker"],
      "metafile": true,
      "write": true,
      "legalComments": "eof",
      "keepNames": true,
      "splitting": false,
      "banner": {
        "js": "/*!\n * mdBlog v__APP_VERSION__\n * (c) 2026 Vanaware - MIT License\n */\n"
      }
    },
    "dist": {
      "default": true,
      "srcdir": "packages/mdblog/src",
      "distdir": "packages/mdblog/dist",
      "clean": ["*"],
      "entryPoints": ["mod.ts"],
      "outfile": "mdblog.min.js",
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": true,
      "sourcemap": "external",
      "drop": ["debugger"],
      "conditions": ["browser", "worker"],
      "metafile": false,
      "write": true,
      "legalComments": "eof",
      "keepNames": true,
      "splitting": false,
      "banner": {
        "js": "/*!\n * mdBlog v__APP_VERSION__\n * (c) 2026 Vanaware - MIT License\n */\n"
      }
    }
  }
}

```

---

## File: `scripts/esbuild.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file esbuild.ts
 * @description CLI of the build orchestrator based on native esbuild.
 * Delegates execution to the @vanaware/buildit library
 * and loads the declarative configuration from esbuild.jsonc.
 */

import { esBuildCli, } from "@vanaware/buildit/cli/esbuild";

if (import.meta.main) {
  const cli = esBuildCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/export.jsonc`

```json
{
  "$schema": "https://vanaware.github.io/buildit/schema/export.json",
  "project": "mdBlog",
  "modes": {
    "example": {
      "outputFile": "snapshots/example.md",
      "includes": [
        "packages/mdblog/public/**/*.{md,js,svg,css,html,manifest.json}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": true,
      "customInstruction": "The text below contains the main SOURCE CODE files of the example application (example).",
      "default": true
    },
    "docs": {
      "outputFile": "snapshots/docs.md",
      "includes": [
        "docs/**/*.{md,txt}",
        "{README.md,LICENSE,.tool-versions,CHANGELOG.md}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": false,
      "customInstruction": "The text below contains the project DOCUMENTATION and architectural guidelines.",
      "default": true
    },
    "server": {
      "outputFile": "snapshots/server.md",
      "includes": [
        "packages/server/{src,tests}/**/*.{tsx,jsx,js,ts,css,html,json,jsonc,yaml,yml,md}",
        "packages/server/{deno.json,deno.jsonc,README.md,.env.example}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": true,
      "customInstruction": "The text below contains the configuration and runtime files of the SERVER @vanaware/server",
      "default": true
    },
    "utils": {
      "outputFile": "snapshots/utils.md",
      "includes": [
        "{deno.json,deno.jsonc,README.md,.env.example,.tools-versions,CHANGELOG.md}",
        "scripts/**/*.{ts,jsonc}",
        ".github/workflows/**/*.{yaml,yml}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": true,
      "customInstruction": "The text below contains the utility code used in the @vanaware/mdblog project, such as build scripts and CI/CD configuration.",
      "default": true
    },
    "mdblog": {
      "outputFile": "snapshots/mdblog.md",
      "includes": [
        "packages/mdblog/{src,tests,dist}/**/*.{tsx,jsx,js,ts,css,html,json,jsonc,yaml,yml,md}",
        "packages/mdblog/{deno.json,deno.jsonc,README.md}"
      ],
      "excludes": [
        "**/node_modules/**",
        "**/.git/**"
      ],
      "includeVersion": true,
      "customInstruction": "The text below contains the main SOURCE CODE files of the mdblog application.",
      "default": true
    }
  }
}

```

---

## File: `scripts/export.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file export.ts
 * @description Context consolidation CLI for AIs in the BuildIt project.
 * Delegates execution and rules to the @vanaware/buildit library
 * and loads the declarative configuration from export.jsonc.
 */

import { exportCli, } from "@vanaware/buildit/cli/export";

if (import.meta.main) {
  const cli = exportCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/sanitize-version.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file sanitize-version.ts
 * @description Semantic version sanitizing CLI for deno.json[c].
 * Normalizes the "version" field to the strict semver format (MAJOR.MINOR.PATCH).
 */

import { sanitizeVersionCli, } from "@vanaware/buildit/cli/sanitize-version";

if (import.meta.main) {
  const cli = sanitizeVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/tag-version.ts`

```ts
/// <reference lib="deno.ns" />

/**
 * @file tag-version.ts
 * @description CLI that creates and publishes a git tag from the deno.json[c] version.
 * Generates tags in the vMAJOR.MINOR format and pushes them to the remote repository.
 */

import { tagVersionCli, } from "@vanaware/buildit/cli/tag-version";

if (import.meta.main) {
  const cli = tagVersionCli();
  await cli.parse(Deno.args,);
}

```

---

## File: `scripts/watch.jsonc`

```json
{
  "$schema": "https://vanaware.github.io/buildit/schema/watch.json",
  "targets": {
    "mdblog": {
      "default": true,
      "srcdir": "packages/mdblog/src",
      "distdir": "packages/server/build/dist",
      "copyFiles": [
        {
          "basedir": "packages/mdblog/public"
        }
      ],
      "entryPoints": [
        "mod.ts"
      ],
      "platform": "browser",
      "format": "esm",
      "bundle": true,
      "minify": false,
      "sourcemap": "inline",
      "conditions": [
        "browser"
      ],
      "write": true,
      "legalComments": "eof",
      "outfile": "mdblog.js",
      "banner": {
        "js": "/*!\n * mdBlog v__APP_VERSION__ [DEV WATCH]\n * (c) 2026 Vanaware - MIT License\n */\n"
      }
    }
  }
}

```

---

## File: `scripts/watch.ts`

```ts
/**
 * BuildIt Watch CLI Entry Point.
 * Delegated to the @vanaware/buildit utility.
 */
import { watchCli, } from "@vanaware/buildit/cli/watch";

if (import.meta.main) {
  await watchCli().parse(Deno.args,);
}

```

---

