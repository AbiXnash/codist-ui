// Package ui is Codist's interface. The Svelte code in src/ is built into dist/, which is committed and embedded
// here, so the Codist binary carries the interface and people who build Codist need no Node.
package ui

import (
	"embed"
	"io/fs"
	"net/http"
	"strings"
)

//go:embed all:dist
var files embed.FS

// Handler serves the interface. Paths that are not files fall back to index.html, so a reload on any screen
// works. Built files under assets/ have hashed names, so browsers may keep them for good.
func Handler() http.Handler { return serve(files) }

// serve serves the dist folder of fsys, or says how to build it when it is missing.
func serve(fsys fs.FS) http.Handler {
	dist, err := fs.Sub(fsys, "dist")
	if err == nil {
		if _, err = fs.Stat(dist, "index.html"); err == nil {
			static := http.FileServerFS(dist)
			return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				p := strings.TrimPrefix(r.URL.Path, "/")
				if p != "" {
					if _, err := fs.Stat(dist, p); err == nil {
						if strings.HasPrefix(p, "assets/") {
							w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
						}
						static.ServeHTTP(w, r)
						return
					}
				}
				w.Header().Set("Cache-Control", "no-cache")
				http.ServeFileFS(w, r, dist, "index.html")
			})
		}
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Error(w, "This build has no interface. Run npm run build in codist-ui.", http.StatusNotFound)
	})
}
