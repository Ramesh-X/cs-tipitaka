```txt
pnpm install
pnpm --filter @cs-tipitaka/api dev
```

```txt
pnpm --filter @cs-tipitaka/api deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
pnpm --filter @cs-tipitaka/api cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>();
```
