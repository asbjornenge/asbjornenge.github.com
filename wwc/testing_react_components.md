# Testing React Components

[React](http://facebook.github.io/react/) offers (imho) a paradigm shifting technology for client side web applications - or GUIs in general for that matter. If you haven't already; give it a try!

One of the things I really like about React is how it lends itself to [TDD](http://en.wikipedia.org/wiki/Test-driven_development) and testing in general. Small, focused components relying mostly on props (parameters) are easy to reason about and requires little mock.

The following are some of my experiences testing React components. Ready? Here we go!

<img src="http://gifs.joelglovier.com/epic/expedition.gif" style="width: 600px" alt="EXPEDITION">

## React Test Utils

React ships with very good test utilities. Unfortunately the documentation is somewhat hidden away on their website. Here is a [link](http://facebook.github.io/react/docs/test-utils.html).

	var React          = require('react')
	var ReactAddons    = require('react/addons') // You also need to require the addons
	var ReactTestUtils = React.addons.TestUtils  // <- YEAH!

## Use jsdom

For any kind of testing to be tolerable, TDD especially, efficient feedback loops are essential. Having to continously pass things off to a browser, or ever worse; multiple browser, is a pain. Luckily we have [nodejs](http://nodejs.org/) & [jsdom](https://github.com/tmpvar/jsdom). The React guys themselves use jsdom for testing.

I like to wrap up jsdom so that it is not required if a <code>document</code> already exists. That way the tests can run both in node and browsers.

    $ vi testdom.js
      module.exports = function(markup) {
          if (typeof document !== 'undefined') return
          var jsdom          = require("jsdom").jsdom
          global.document    = jsdom(markup || '')
          global.window      = document.createWindow()
          // ... add whatever browser globals your tests might need ...
      }
    
    $ vi test/spec.js
      require('../testdom')('<html><body></body></html>')
      console.log(document)

Later we will see how we can hook up our tests to a [CI](http://en.wikipedia.org/wiki/Continuous_integration) tool for some sweet cross browser coverage.

## Avoid JSX

It's up to you, but using [jsx](http://facebook.github.io/react/docs/jsx-in-depth.html) introduces an additional build step everywhere without adding much of a benefit. Using the React.DOM javascript API is really straight forward. It'll take you 2 minutes to figure out.

![FAIL](http://gifs.joelglovier.com/fail/kayak-diving.gif)

## Include a common render function

For each test you want a clean slate. Usually this means rendering the component again. It makes sense wrapping the render code into a function.

    var _ = require('lodash') // or similar
    var defaultProps = {}

    function render(newProps, callback) {
        var props = _.merge(defaultProps, newProps)
        return React.renderComponent(Component(props), document.body, function() {
            if (typeof callback === 'function') setTimeout(callback)
        })
    }

I find that keeping a set of defaultProps around makes sense. Callers of render can pass their required props (*newProps*) and have that merged with defaultProps before rendering. Overwriting the defaults if they want. Since we are testing components in isolation we can usually just mount to <code>document.body</code>. React's <code>renderComponent</code> takes a callback that is called when the component has finished rendering. I found that pushing my *render*'s callback to the next tick of the eventloop (using *setTimeout*) resulted in a more stable test environment.

## Clean up after each test

If you try to render a React component into a DOM which already has react identifiers, React will merge with whatever is already there. Especially when testing the same component over and over your need to clean up your DOM state.

How to do this depends on your test framework. Here is what I do in [mocha](http://visionmedia.github.io/mocha/) (tdd interface):

    describe('My Component', function() {

        afterEach(function(done) {
            React.unmountComponentAtNode(document.body) // Assuming mounted to document.body
            document.body.innerHTML = ""                // Just to be sure :-P
            setTimeout(done)
        })

        ...tests...
    })

We use React's <code>React.unmountComponentAtNode</code> to unmount the component. Just to be safe we also reset body's innerHTML. I found once again that pushing the callback (*done*) to the next tick of the eventloop (using *setTimeout*) created a more stable test suite.

## Query the DOM

You can query the DOM directly using the tool of your choice, or you can use the **ReactTestUtils** to query React components.

    it('should render an input', function(done) {
        var _tree = render({}, function() {
            var __input = document.querySelectorAll('input')
            var _input  = ReactTestUtils.findRenderedDOMComponentWithTag(_tree, 'input')
            assert(...)
        })
    })

As you might have noticed the **findRenderedDOMComponentWithTag** (and most other functions of **ReactTestUtils**) require a ReactComponent parent/tree to query. Luckily we designed our ***render*** function to return the top level component.

## Simulate events

The **ReactTestUtils** also let's you simulate events. This is very useful!

    it('should do something when I click mySpecialButton', function(done) {
        var _tree = render({}, function() {
            var _button = ReactTestUtils.findRenderedDOMComponentWithClass(_tree, 'mySpecialButton')
            ReactTestUtils.Simulate.click(_button)
            assert(...)
        })
    })

For more about the capabilities of **ReactTestUtils** check out the [docs](http://facebook.github.io/react/docs/test-utils.html).

## Faking XMLHttpRequests

(*Not really React specific, but I'll add a note about it anyway.*)

Need to fake XMLHTTPRequests? There is a [module](https://www.npmjs.org/package/fakexmlhttprequest) for that!

    var FakeXMLHTTPRequests = require('fakexmlhttprequest')

    var requests   = []
    XMLHttpRequest = function() { 
        var r =  new fakeXMLHttpRequest(arguments)
        requests.push(r)
        return r
    }
    
    describe('My component', function() {
	
        afterEach(function() {
            requests = [] // <- Reset request pool after each test
            ...
        })
        
        it('gonna get some data over the wire', function(done) {
            var onDataReceived = function(data) { assert(...); done() }
            render({ onDataReceived : onDataReceived }, function() {
                assert(requests.length > 0)
                requests[0].respond(200, { "Content-Type": "application/json" }, JSON.stringify({...}))
            })
        })
	
    })

## Running test

I use mocha solely for the [nyancat](http://www.nyan.cat/) reporter.  

	npm install -g mocha

I also find it useful to add my test command to <code>package.json</code> so that I can run my tests consistently with the same command across projects.

    $ vi package.json
        ...
        "scripts": {
            "test": "mocha -R nyan -w --check-leaks",
        },
        ...

    $ npm test

![NYANCAT](../img/nyancat.gif =150x)

## Testling

Running the tests in node is convenient and fast, but it is **NOT THE SAME** as running them in actual browser. So, we need to hook up some actual browser testing too. [Testling](https://ci.testling.com/) is a great alternative and free for open source projects. They have great [documentation](https://ci.testling.com/guide/quick_start) and even a special little guide for using [mocha](https://ci.testling.com/guide/mocha). Plus, it will get you some sweet badges like this:

[![browser support](https://ci.testling.com/asbjornenge/nanoxhr.png)
](https://ci.testling.com/asbjornenge/nanoxhr)

There is one little trick I wanted to add though. Testling users [browserify](http://browserify.org/) to create a browser compatible bundle of your javascripts. Unfortunately jsdom is not compatible with browserify, so we have to tell testling to ignore it.

In your <code>package.json</code> add a *browser* field and add tell browserify to ignore *jsdom*.

    $ vi package.json
    
    ...
    "browser" : {
        "jsdom" : false
    },
    ...

Since we, in our jsdom wrapper above, only try to require jsdom if no document exists; the browser will never reach that code and we are good. The tests will use the browser's DOM. 

![YOU](http://gifs.joelglovier.com/fresh-prince/carlton.gif =300x)

Now go get some test coverage for your React components!

## Credits

♥ to the React guys.  
And the nyancat.  
And coffee.  
And tests.


enjoy!