# Snowflake maze generator

## What is it for? ##

Just a nice creative coding exercise in the spirit of christmas!

## How does it work? ##

Start with a [triangular tesselation](https://en.wikipedia.org/wiki/Triangular_tiling)

This tesselation has an interesting property: even though the triangles have only three sides,
it's actually possible to move over the grid in six directions! We use this to draw nice snowflakes, which always have a six-fold symmetry.

To make a snowflake, just start at a random point and branch out in six directions. Occasionally, we make side branches, always maintaining the six-fold symmetry.

The snowflakes are not drawn directly, but used as input for the next step. We use [Prim's algorithm](https://en.wikipedia.org/wiki/Prim%27s_algorithm) to generate a maze on the triangular grid. The edges that make up part of the snowflake have a lower weight, so the algorithm prefers to join them together first.  

And so we end up with a nice looking maze!

## Other techincal info ##

Uses
* [HTML Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) to draw graphics to the page.
* [pdfkit](https://pdfkit.org/) to generate a PDF.
* A background [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) to keep the user interface nice.

## See also ##

My source of inspiration was:
http://www.mazesforprogrammers.com/