# ImageTodo

ImageTodo is an offline-first desktop application built with Tauri 2 and React. This repository currently contains the foundational project scaffold with a borderless, draggable window and security defaults aligned with the product requirements.

## Getting Started

```bash
pnpm install
pnpm tauri dev
```

## Development Server

```bash
pnpm dev
```

Runs Vite on http://127.0.0.1:5173 for Tauri integration.

## Building

```bash
pnpm tauri build
```

## Project Structure

```
src/
 ├─ app/            # Root application shell and global layout
 ├─ components/     # Reusable UI components
 ├─ hooks/          # Shared React hooks
 ├─ services/       # Side-effectful modules and Tauri bridges
 ├─ stores/         # Zustand stores and selectors
 ├─ types/          # Shared TypeScript types
 ├─ utils/          # Pure utility helpers
 └─ test/           # Test utilities and setup files
```

The application target is fully local – no network dependencies are bundled or required at runtime.
