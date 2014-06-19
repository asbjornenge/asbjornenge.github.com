# Testing React Components

[React](http://facebook.github.io/react/) offers (imho) a paradigm shifting technology for client side web applications - or GUIs in general for that matter. If you haven't already; give it a try!

One of the things I really like about React is how it lends itself to [TDD](http://en.wikipedia.org/wiki/Test-driven_development) and testing in general. Small, focused components relying mostly on props (parameters) are easy to reason about and requires little mock.

The following are some of my experiences testing React components.

## React Test Utils

React ships with very good test utilities. Unfortunately the documentation is somewhat hidden away on their website. Here is a [link](http://facebook.github.io/react/docs/test-utils.html).

Here is how to require them:

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

It's up to you, but using [jsx](http://facebook.github.io/react/docs/jsx-in-depth.html) introduces an additional step everywhere without adding much of a benefit. Just using the React.DOM javascript API is really straight forward. It'll take you 2 minutes to figure out.

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

I find that keeping a set of defaultProps around makes sense. Callers of render can pass their required props (*newProps*) and have that merged with defaultProps before rendering. Overwriting the defaults if they want. Since we are testing components in isolation we can just mount to <code>document.body</code>. React's <code>renderComponent</code> takes a callback that is called when the component has finished rendering. I found that pushing my *render*'s callback to the next tick of the eventloop (using *setTimeout*) resulted in a more stable test environment.

## Clean up after each test

If you try to render a React component into a DOM which already have react identifiers, React will merge with whatever is already there. Especially when testing the same component over and over your need to clean up your DOM state.

How to do this depends on your test framework. Here is what I do in [mocha](http://visionmedia.github.io/mocha/) (tdd interface):

    describe('My Component', function() {

        afterEach(function(done) {
            React.unmountComponentAtNode(document.body) // Assuming mounted to document.body
            document.body.innerHTML = ""                // Just to be sure :-P
            setTimeout(done)
        })

        ...tests...
    })

We use React's <code>React.unmountComponentAtNode</code> to unmount the component. Just to be safe we also reset body's innerHTML. I found again that pushing the current callback to the next tick of the eventloop (using *setTimeout*) once again created a more stable test suite.

## Query the DOM

You can query the DOM directly using the tool of your choice, I usually just go with <code>document.querySelectorAll</code>. Or you can use the **ReactTestUtils** to query React components.

    it('should render an input', function(done) {
        var _tree = render({}, function() {
            var __input = document.querySelectorAll('input')
            var _input  = ReactTestUtils.findRenderedDOMComponentWithTag(_tree, 'input')
            assert(...)
        })
    })

As you might have noticed the **ReactTestUtils** require a ReactComponent to query in. The **React.renderComponent** return the rendered component, so I have designed the common ***reder*** function to return it as well.

## Simulate events

The **ReactTestUtils** also let's you simulate events.

    it('should do something when I click mySpecialButton', function(done) {
        var _tree = render({}, function() {
            var _button = ReactTestUtils.findRenderedDOMComponentWithClass(_tree, 'mySpecialButton')
            ReactTestUtils.Simulate.click(_button)
            assert(...)
        })
    })

For more about the capabilities of **ReactTestUtils** check out the [docs](http://facebook.github.io/react/docs/test-utils.html).

## Faking XMLHttpRequests

*Not really React specific, but I'll add a note about it anyway.*

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
                // Component is rendered and should have requested some data
                assert(requests.length > 0)
                // Respond
                requests[0].respond(200, { "Content-Type": "application/json" }, JSON.stringify({...}))
            })
        })
	
    })

## Running test

I use mocha solely for the [nyancat](http://www.nyan.cat/) reporter.  

	npm install -g mocha

npm test

## Testling

browser field