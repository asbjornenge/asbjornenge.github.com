# My first real fight with fonts

Fonts are important. Most of what we see on our screens is text in some form, or typeface, to dive right into the syntax. 

Starting out on my current font adventure I was quite shocked by how little I knew about the font world. I had been developing websites and apps full of text for years, but hardly knew what a baseline was. To some extent that is a good thing, it had just worked. On the other hand, it is a level of control over my design I had been completely ingorant about.

## Syntax

> Improve this

In the good old days it was (apparently) well understood that a typeface was a collection of glyphs or characters in the same design, while a font was simply the typeface's size.

"TO be out of sorts"

## The design bullet

The current problem I was facing seemed simple enough; allow a line of text to inclue a bullet. Easy as pie.

	<span style="display:list-item">Some Text</span>

Turned out it wasn't quite that easy. These bullets were part of our clients design manual, but they were not the same as the bullet glyph of the font. Modifying the font was also out of the question because of licensing.

But, there was a clear definition; the bullet was a square of *height* and *width* **x** relative the *font-size*, and vertically aligned center on the font's [**x-height**](http://en.wikipedia.org/wiki/Baseline_(typography\)).

Calculating the x-height of a target element is easy enough using css's [**ex**](http://www.w3.org/Style/Examples/007/units#units) unit.

	$('<div style="width:1ex"></div>').appendTo(target)[0].offsetWidth

But the x-height itself was of little use. To vertically align my bullet with the x-height, I needed to know the margin, bottom or top, of the **baseline** or **median**; I needed more metrics.

Alright, easy enough. Let's see… *"javascript font metrics"*. Uhm…  

#### The bad news

There is no built-in, easy, standard way of extracting the metrics of a font.  

#### The good news

It's possible to calculate! AND, there is an emerging [library](https://github.com/Pomax/Font.js) that will do most of the heavy lifting for you! We'll get to that :-)

## Calculation

There are two approaches to calculate a font's vertical metrics as far as I can tell.

### 1. Measuring dom elements

The first [approach](http://www.brunildo.org/test/xheight.pl) is using a bunch of dom elements with spesific font-related metrics (1em, 1ex, etc.) and measure these in px (offsetWidth) at different levels and at different font-size's.

The approach seems to work quite well for the calculation part. Sturdy across browsers and fonts. For the actual positioning there were other icebergs floating around.

NB! The solution is a possible performance drain if used unwisely - measuring offsetWidth might cause unwanted reflow (repaint of your dom elements).

### 2. Canvas

The second [approach](http://processingjs.nihongoresources.com/FontMetrics/) is using the canvas element. The 2d context of a canvas has *font*, *fillText* and *measureText* functions. Unfortunately [*measureText*](http://www.w3.org/TR/2012/WD-2dcontext-20120329/#dom-context-2d-measuretext) only deals with the [width](http://www.w3.org/TR/2012/WD-2dcontext-20120329/#textmetrics) metric, but that seems to be about to [change](http://www.w3.org/TR/2dcontext/#textmetrics) (!!). For now though, the approach is to dump and analyze the raw pixel data and figure out how many pixels are used vertically to draw different letters of the font.



## Font-face

### Timing

### Rendering

## Font.js

* Timing issues - when is the font loaded?

http://pomax.nihongoresources.com/pages/Font.js/

http://www.brunildo.org/test/xheight.pl

http://www.icavia.com/2010/09/solving-font-face-alignment-issues/

http://mudcu.be/journal/2011/01/html5-typographic-metrics/

http://www.owlfolio.org/htmletc/legibility-of-embedded-web-fonts/

http://en.wikipedia.org/wiki/Baseline_(typography)
