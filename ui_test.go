package ui

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"
)

func get(h http.Handler, path string) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	h.ServeHTTP(w, httptest.NewRequest(http.MethodGet, path, nil))
	return w
}

func TestServe(t *testing.T) {
	h := serve(fstest.MapFS{
		"dist/index.html":      {Data: []byte("<html>app</html>")},
		"dist/assets/app-1.js": {Data: []byte("js")},
		"dist/favicon.svg":     {Data: []byte("<svg/>")},
	})
	cases := []struct{ path, body, cache string }{
		{"/", "<html>app</html>", "no-cache"},
		{"/graph/some.Class", "<html>app</html>", "no-cache"}, // a screen, not a file
		{"/assets/app-1.js", "js", "public, max-age=31536000, immutable"},
		{"/favicon.svg", "<svg/>", ""},
	}
	for _, c := range cases {
		w := get(h, c.path)
		if w.Code != 200 || w.Body.String() != c.body || w.Header().Get("Cache-Control") != c.cache {
			t.Errorf("%s: %d %q cache %q", c.path, w.Code, w.Body.String(), w.Header().Get("Cache-Control"))
		}
	}
}

func TestServeWithoutBuild(t *testing.T) {
	for _, fsys := range []fstest.MapFS{{"dist/.gitkeep": {}}, {"other/x": {}}} {
		w := get(serve(fsys), "/")
		if w.Code != 404 || !strings.Contains(w.Body.String(), "npm run build") {
			t.Errorf("%d %q", w.Code, w.Body.String())
		}
	}
}

// The committed build is embedded and served.
func TestEmbedded(t *testing.T) {
	w := get(Handler(), "/")
	if w.Code != 200 || !strings.Contains(w.Body.String(), "<html") {
		t.Errorf("%d %.80q", w.Code, w.Body.String())
	}
}
