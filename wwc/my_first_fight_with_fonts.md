# In my @font-face

> My first real fight with fonts

#### Disclaimer

Before I even start this I should probably state that this adventures leads into unfamiliar terrain and over half my findings are probably half-witted nonsense. There. I should probably start all my blogposts like that.

#### Introduction

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

This approach also works perfectly for the calculation part, and thanks to the awesome [fontmetrics.js](http://processingjs.nihongoresources.com/FontMetrics/fontmetrics.js) it's easy.  

But again, for the actual positioning, I was soon stuck in a pitch black room (next to a tiny, grey, startling little cat with diarrhea. Sitting on a matressless, iron-sprung bed with its huge eyes mewing at me. Meow. Smoking as well, probably. And then some terrible guy the colour of an aubergine round the corner holding a mug of beef tea and wearing a string vest going “meew. Fuckn brrr aaah” ~ Dylan Moran).

## @font-face

The days of web typography is upon us. We are no longer limited to a handful of built-in fonts, but using technologies like [@font-face](http://sixrevisions.com/css/font-face-guide/) we can embed "any" font on our page and have it render "beautifully" on the client's browser.

There are however quite a few [pitfalls](http://www.fontsquirrel.com/blog/2010/11/troubleshooting-font-face-problems) & [legibility](http://www.owlfolio.org/htmletc/legibility-of-embedded-web-fonts/) issues.

### Rendering

The one that hit me hard in the face is the fact that different browsers, and even the same browsers on different operating systems, deal very differently with how they render fonts. Even different versions of the same operating system will sometimes render fonts very differently.

> At typical body-text sizes, the computer has to draw each letter using only 15 or so pixels in each direction. It’s not possible to draw each letter exactly as the typographer intended, and keep all the lines crisp and smooth, with that few pixels. Windows, OSX, and Linux all resolve this dilemma differently: to oversimplify a bit, OSX tries harder to preserve the font shapes, Windows tries harder to make the lines sharp, and Linux tries to do both at once and winds up achieving neither. ~ Zachary Weinberg @ http://www.owlfolio.org

Sometimes the font won't even render inside it's bounding box (!!!!), that makes any font metric calculatino futile :-(

### Timing

Another issue with embedded font's is knowing when the font is loaded. If you try to measure prematurely you will end up measuring the fallback font, and thats no good. 

The only viable solution I have come across is using a "dummy" fallback font that will encode a character as a zero-width unit. Putting that in a paragraph and polling for a real width. It's not a great solution but it works.

## Font.js

Fotunately someone has already thread this path for us.  
[Font.js](http://pomax.nihongoresources.com/pages/Font.js/) adds a **Font** object to your javascript toolbelt. It's designed to behave similar to the **Image** object.

	var font = new Font();
	font.onload  = function() {}
	font.onerror = function() {}
	font.src = "http://your.domain.com/fonts/font.otf"

It handles **timing** issue using the detailed solution above, and will call your *onload* function when the font is available.  
It gives you **metrics**

	font.metrics -> {}
	font.measureText(string, size) -> {}

They even handle the **rendering** issue (to some extent).

*Font.js actually draws text offscreen, does a scanline pass to find out what the "real" ascent and descent is, and then sets height to ascent + 1 + descent ("1" for the baseline itself). This generally works quite well, but will lead to incorrect heights for fonts that don't implement the Latin blocks =)   
~ Michiel Kamermans*

One important thing to note is that the font's are loaded using **XMLHttpRequest**'s. This is important since it is the only way to get the font data so it can be inspected and manipulated. But it does mean you have to deal with hosting your own fonts or setting up [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) to avoid *Access-Control-Allow-Origin* issues. 

Font.js is a great library for solving most of the current headaches related to fonts.

* bower

## Resources

http://pomax.nihongoresources.com/pages/Font.js/  
http://www.brunildo.org/test/xheight.pl  
http://www.icavia.com/2010/09/solving-font-face-alignment-issues/  
http://mudcu.be/journal/2011/01/html5-typographic-metrics/  
http://www.owlfolio.org/htmletc/legibility-of-embedded-web-fonts/  
http://en.wikipedia.org/wiki/Baseline_(typography)  
http://stackoverflow.com/questions/1134586/how-can-you-find-the-height-of-text-on-an-html-canvas  
