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

## Licence

Source available under the [PolyForm Noncommercial License 1.0.0](LICENSE): free for any noncommercial purpose, such
as personal study, research, hobby projects and testing, and for use by charities, schools, public research and
public health bodies and government institutions. **Using it for a business, or in anything sold, needs a commercial
licence** from the author: open an issue at [github.com/AbiXnash/codist](https://github.com/AbiXnash/codist/issues)
to ask. Third-party code included in Codist keeps its own licence.

Required Notice: Copyright 2026 Abinash (https://github.com/AbiXnash)
