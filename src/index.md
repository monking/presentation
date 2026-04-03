---
title: Demo Presentation
...

# Navigation

## Begin by pressing the `down` key

Reveal content with the `Down` arrow (`Up` to reverse).

Show the next slide with the `Right` arrow key (`Left` for previous).

Press `?` to see a list of keyboard shortcuts.

## Jump around

Show entire slides at once with `PageDown`/`PageUp` keys

*On the first slide, press `PageUp` to reveal the entire slide.*

To jump to the beginning/end with `Home`/`End`.

## Cues

The header will show

- **`»`** when a slide is fully revealed
- **`•`** when the presentation is ended\*

[linking](#5.$), [source](#$.$)


# Formatting

## Markdown

The input Markdown is rendered using [`pandoc`](https://pandoc.org)
```sh
pandoc -f markdown -t html \
  --embed-resources --standalone \
  --include-in-header=".tmp-head-include.html"
```
Presentation styles and scripts are packed into a temporary file.


## Linking to slides

Your position in the presentation is also stored in a URI fragment, so you can
reload the page and keep your place, or insert links, like
```md
full [first](#1.$) and [last](#$.$) slides
```
> full [first](#1.$) and [last](#$.$) slides

Links are of the form `#SLIDE.ELEMENT`, where:

- `SLIDE` is a 1-indexed slide number.
- `ELEMENT` (optional) is a 1-indexed content element number.  

Either `SLIDE` or `ELEMENT` may be `$` for the last value.


# Wrapping up

## Markdown source

Here's the source of this presentation:

<div style="font-size: 0.7em">

`````markdown
---
title: Demo Presentation
...

# Overview

## Begin by pressing the `down` key

Reveal content with the `Down` arrow (`Up` to reverse).

Show the next slide with the `Right` arrow key (`Left` for previous).

Press `?` to see a list of keyboard shortcuts.

## Jump around

Show entire slides at once with `PageDown`/`PageUp` keys

*On the first slide, press `PageUp` to reveal the entire slide.*

To jump to the beginning/end with `Home`/`End`.

## Cues

The header will show

- **`»`** when a slide is fully revealed
- **`•`** when the presentation is ended\*

[linking](#5.$), [source](#$.$)


# Formatting

## Markdown

The input Markdown is rendered using [`pandoc`](https://pandoc.org)
```sh
pandoc -f markdown -t html \
  --embed-resources --standalone \
  --include-in-header=".tmp-head-include.html"
```
Presentation styles and scripts are packed into a temporary file.


## Linking to slides

Your position in the presentation is also stored in a URI fragment, so you can
reload the page and keep your place, or insert links, like
```md
full [first](#1.$) and [last](#$.$) slides
```
> full [first](#1.$) and [last](#$.$) slides

Links are of the form `#SLIDE.ELEMENT`, where:

- `SLIDE` is a 1-indexed slide number.
- `ELEMENT` (optional) is a 1-indexed content element number.  

Either `SLIDE` or `ELEMENT` may be `$` for the last value.


# Wrapping up

## Markdown source

Here's the source of this presentation:

<div style="font-size: 0.7em">

````markdown
((This source, code fence with more than 3 backticks, to contain nested code fenced blocks.))
````

</div>

\* The **`•`** symbol appears in the *last `<h1>`*, which may contain multiple slides, one for each `<h2>`.
`````

</div>

\* The **`•`** symbol appears in the *last `<h1>`*, which may contain multiple slides, one for each `<h2>`.
