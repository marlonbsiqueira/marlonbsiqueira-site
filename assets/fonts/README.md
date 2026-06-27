# /assets/fonts — optional

This site loads **Archivo** (headings) and **Inter** (body) from Google Fonts via the
`<link>` tags in `index.html`, so no font files are required.

If you prefer to self-host (fully offline / no Google request), download the two
families, drop the `.woff2` files here, and add matching `@font-face` rules at the top
of `css/styles.css`. Then remove the Google Fonts `<link>` tags from `index.html`.
