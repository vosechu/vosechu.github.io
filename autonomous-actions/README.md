# Autonomous actions

A circuit-breaker and bulkhead simulator teaching why bulkheads fix circuit breaker failures on slow dependencies.

## Running

Serve with `npx serve` or `python3 -m http.server`, then open the served URL (e.g. `http://localhost:3000` or `http://localhost:8000`) in your browser. The file:// protocol will not work because ES modules require the proper MIME type headers that only an HTTP server provides.

## Live site

https://chuckvose.com/autonomous-actions/

Served as a static page from the vosechu.github.io Jekyll site. The directory has no front matter, so Jekyll copies it verbatim; there is no build step.
