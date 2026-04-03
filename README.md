# Presentation

Turn a Markdown file into an HTML/JavaScript presentation. Uses `pandoc` for Markdown-HTML conversion.

## usage

Run `bin/build [OPTIONS] [FILES...]` to generate the presentation once.  
Without `FILES`, any `*.md` files in `src/` are rendered into the `dist/` folder.

Press `?` on a presentation to see keyboard shortcuts.

For OPTIONS info, run `bin/build -h`.

Run `bin/build -w &` to generate HTML from markdown in the background.

---

**Note**: The presentation uses some [ES6](http://www.ecma-international.org/ecma-262/6.0/index.html) features:
[classes](http://www.ecma-international.org/ecma-262/6.0/#sec-class-definitions),
[arrow functions](http://www.ecma-international.org/ecma-262/6.0/#sec-arrow-function-definitions),
[`const`/`let`](http://www.ecma-international.org/ecma-262/6.0/#sec-let-and-const-declarations),
[default function parameters](http://www.ecma-international.org/ecma-262/6.0/#sec-functiondeclarationinstantiation), etc.
Basically, it [won't run in Internet Explorer](https://kangax.github.io/compat-table/es6/).

## script changes considered and not made

TL;DR: keyboard control only, for now

I'd considered enabling the mouse to advance content with the mousewheel, and
move the next and previous slides by clicking on the right and left sides, but
I though it wouuld be more valuable to leave the mouse free to interact with
the slides (scrolling _and_ clicking).

I'd also originally made it so that advancing the content to the end of a slide
wouuld automatically go to the next slide. This would be nice for a clicker or
some simple input. But for me, it's too easy to spam the arrow key as I'm
racing to the end of a slide, and shoot off to the next slide unintentionally.
This way I don't have to worry about ditching a slide prematurely.
