# Astro Starter Kit: Minimal

```sh
pnpm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                                           |
| :--------------------- | :--------------------------------------------------------------- |
| `pnpm install`         | Install dependencies                                             |
| `pnpm dev`             | Start local dev server at `localhost:4321`                       |
| `pnpm build`           | Build production site to `./dist/`                               |
| `pnpm preview`         | Preview the production build locally                             |
| `pnpm typecheck`       | Type-check Astro/TS (`astro check`)                              |
| `pnpm lint`            | Lint the codebase with ESLint                                    |
| `pnpm lint:fix`        | Lint + auto-fix where possible                                   |
| `pnpm format`          | Format files with Prettier (writes changes)                      |
| `pnpm format:check`    | Check formatting with Prettier (no writes; CI-friendly)          |
| `pnpm test`            | Run tests with Vitest                                            |
| `pnpm check`           | Run `typecheck`, `lint`, `format:check`, and `test` (all-in-one) |
| `pnpm astro ...`       | Run Astro CLI commands (e.g. `astro add`, `astro check`)         |
| `pnpm astro -- --help` | Show Astro CLI help                                              |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
