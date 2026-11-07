# codist-ui

The interface of [Codist](https://github.com/AbiXnash/codist), in Svelte 5. The build in `dist/` is committed and
embedded by the Go package in this repository, so the Codist binary carries the interface and building Codist needs
no Node.

```bash
npm install
npm run dev     # live reload on :5173, with /api sent to Codist on :8080 (CODIST_API to change)
npm run build   # rebuilds dist/; commit it with the change
```

```go
import ui "github.com/AbiXnash/codist-ui"

mux.Handle("/", ui.Handler())
```
