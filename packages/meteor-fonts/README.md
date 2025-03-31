# mys:fonts

Load fonts from node modules and any directory.

## Installation

```bash
meteor add mys:fonts
```

## fonts.json

**- `map`**

This package requires a `map` of fonts that contains:

- **source path** - an absolute path where to look for a font
- **destination path** - an absolute path where to put that font

**- `extensions: array`** default: `ttf, woof`

It also depends on `extensions`. It tells the plugin which files we want to use as fonts.

By default:
- ttf
- woof

**- `verbose: boolean`** default: `false`

Displays informations about used fonts.

It's important to keep `fonts.json` inside the **root directory** of your app.

## An example configuration

Let's say we're using `ionic-angular` package.

`node_modules/ionic-angular/fonts/roboto-bold.ttf`

file should be available in browser as

 `http://example.com/fonts/roboto-bold.ttf`.

This is how configuration of `fonts.json` would look like:

```json
{
  "extensions": [
    "ttf"
  ],
  "map": {
    "node_modules/ionic-angular/fonts/roboto-bold.ttf": "fonts/roboto-bold.ttf"
  }
}
```
