## Architecture
- Keep the application on TanStack Start with distinct content routes and a shared root shell so navigation and SSR stay consistent.
- The demo uses a single React Context with versioned localStorage persisted after hydration; no real accounts or payments are performed.
- Store seed species, posts and expenses centrally so catalog, community and administration share the same data.
- Generate the app-shell service worker with vite-plugin-pwa and register only through the guarded pwa module; HTML uses NetworkFirst.
