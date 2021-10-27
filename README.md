# Snowflake maze generator

## What is it for? ##

Just a nice creative coding exercise in the spirit of christmas! Made by [@mpvaniersel](https://twitter.com/mpvaniersel)

## How does it work? ##

I started with a [triangular tiling](https://en.wikipedia.org/wiki/Triangular_tiling)

Even though triangles have only three sides, you can actually move over the grid in six directions! I thought this was nice because it makes it possible to draw [snowflakes](https://en.wikipedia.org/wiki/Snowflake), which always have a six-fold symmetry.

To make a snowflake, I just start at a random point and branch out in six directions. Occasionally, I add some side branches, always maintaining the six-fold symmetry.

The snowflakes are not drawn directly, but used as input for the next step. I used [Prim's algorithm](https://en.wikipedia.org/wiki/Prim%27s_algorithm) to generate a maze on the triangular grid. The edges that make up part of the snowflake have a lower weight, so the algorithm prefers to join them together first.

And so we end up with a nice looking maze with snowflakes shining through.

## Other techincal info ##

I've used...
* [HTML Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) to draw graphics on the page.
* [pdfkit](https://pdfkit.org/) to generate a PDF.
* A background [Worker](https://developer.mozilla.org/en-US/docs/Web/API/Worker) to keep the user interface nice.

## See also ##

My source of inspiration was [Mazes for programmers](http://www.mazesforprogrammers.com/)