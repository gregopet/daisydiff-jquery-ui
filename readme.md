# Daisy Diff jQuery UI #

This is a rewrite of the [Daisy Diff](http://code.google.com/p/daisydiff/) 1.2 user interface using jQuery UI. It requires no changes on the server side (other then adding two new libraries to the output HTML) as it provides shims for the HTML inlined function calls generated by Daisy Diff. A demo is available [here](http://freeweb.siol.net/akrasko1/daisydiff-jquery-ui/demo.html).

## Reasons for a rewrite ##

The original code has several issues: 

* uses obscure and seemingly obsolete libraries
* doesn't follow the [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself) principle
* needs hardcoded setup of the images path in multiple separate locations
* cannot easily add mouseover events for showing diffs
* doesn't use a library to abstract browser-specific tasks or DOM manipulation
* the inline comments could be better

## Ignoring of document sections ##

Having included Daisy Diff in a project that tracks online documents and alerts human operators when one of these documents has changed, an important feature request was for a way to make Daisy Diff ignore trivial changes (e.g. hit counters, current dates) to save users time. A [topic](https://groups.google.com/forum/?fromgroups#!topic/daisydiff/-DKD2LzeAQE%5B1-25%5D) in the Daisy Diff mailing list exists on this very subject so apparently other projects have met this requirement as well. While the suggestion proposed in the mailing list tackles the problem on the backend (by providing an XSL stylesheet which eliminates the trivial part), a way to have the clients themselves pick which areas to ignore would have to be implemented.

The `mark-ignore-areas` branch of this project implements such a user interface: users can highlight a diffed section and use the `ignore more` and `ignore less` controls to draw ignore areas around the diffs. The Javascript code generates an XPath expression that targets the selected area and can be easily used to create an XSL rule to ignore the desired part of the DOM.

To use this functionality in their own projects, implementers must provide a single function that is fired on each ignore area change and whose argument is an array of XPath expressions to marked ignore areas. Presumably, AJAX will be used to communicate these areas to the back end. Another function, one that marks previously selected areas, is provided but can also be overriden if desired (a Javascript XPath [implementation](http://js-xpath.sourceforge.net/) is used to support Internet Explorer).

## Future plans ##

Besides the ignore sections, there are certainly global improvements one could think of. One would be to generate an index of changes for easier navigation. If anyone has use for this project, I would be happy to accept feature suggestions!

Improvements to both `master` and `mark-ignore-areas` branches so far:

* configurable setting to display diff dialogs on mouse over as well
* Firefox now copies the diff background colors

## Technologies used ##

This rewrite uses the [jQuery](http://jquery.com/) and [jQuery UI](http://jqueryui.com/) libraries for the user interface. They bring in an API familiar to most javascript developers with solid documentation, theming and even plugin support, should it ever be needed.

The source is written in [CoffeeScript](http://coffeescript.org/).