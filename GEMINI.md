# Blog Website for Komal - GEMINI.md

This project is a modern blog website built using the Next.js App Router, React 19, and Tailwind CSS 4. It is designed to be a high-performance, aesthetically pleasing platform for Komal's content.

## Project Overview

- **Core Framework:** [Next.js](https://nextjs.org/) (Version 16.1.6)
- **UI Framework:** [React](https://reactjs.org/) (Version 19.2.3)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Version 4.0.0+)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Package Manager:** `npm` (implied by `package-lock.json`)

### Architecture

The project follows the standard Next.js App Router structure:
- `src/app/`: Contains routes, layouts, and global styles.
  - `layout.tsx`: Root layout defining HTML structure, global fonts (Geist), and metadata.
  - `page.tsx`: The main entry point for the homepage.
  - `globals.css`: Global CSS using Tailwind 4's `@import` syntax.
- `public/`: Static assets such as icons and images.
- `next.config.ts`: Next.js specific configurations.

## Building and Running

The following scripts are available in the project:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server with Hot Module Replacement (HMR). |
| `npm run build` | Compiles the application for production. |
| `npm run start` | Starts the production server after building. |
| `npm run lint` | Runs ESLint to check for code quality issues. |

## Development Conventions

- **Tailwind CSS 4:** Uses the new `@import "tailwindcss";` syntax in `globals.css`. Custom themes are defined using the `@theme` directive.
- **Fonts:** Utilizes `next/font/google` for Geist and Geist Mono fonts.
- **Metadata:** Metadata is managed in `layout.tsx` for SEO and browser tab titling.
- **Icons:** SVG assets are stored in the `public/` directory and referenced directly.
- **Strict Typing:** TypeScript is used throughout the project with a `tsconfig.json` configuration.
- **Linting:** ESLint is configured with `eslint.config.mjs` for code consistency.

## TODOs

- [ ] Implement blog post listing page.
- [ ] Create individual blog post template.
- [ ] Set up a Content Management System (CMS) or local Markdown support for posts.
- [ ] Customize metadata for SEO in `src/app/layout.tsx`.
