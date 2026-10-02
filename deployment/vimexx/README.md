# Static hosting

Live site: https://ai-governance-map.tjebbe-boersma.com/

Build with `node scripts/build-vimexx.mjs`. Upload only the contents of `outputs/vimexx/upload/`, including `.htaccess`, to your site's document root. Upload assets before replacing `index.html`. Keep previous releases outside the web root; move uploaded archives outside it after extraction.

The manifest at `outputs/vimexx/manifest.json` records SHA256 hashes for verification. Do not upload the manifest, source repository, dependencies or credentials. The build includes the globe, regional and Netherlands maps, source library, incident tutorial, both scenarios, careers questionnaire and Netherlands job board. The separate game prototype is not included.

The deployed website is static React, with locally bundled fonts and logos. Hash routes such as `#scenario`, `#careers` and `#jobs` require no rewrite rules. HTTPS must be configured on your host. Cloudflare may proxy the origin, but a Tunnel and local Mac server are not needed.

On Vimexx, use DirectAdmin's file manager or an encrypted FTP account scoped to the correct document root. Back up existing files before replacing a release. Hosting-specific account identifiers, DNS records and credentials are intentionally kept out of this repository.
