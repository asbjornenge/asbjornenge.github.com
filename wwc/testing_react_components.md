# Testing React Components

[React](http://facebook.github.io/react/) offers (imho) a paradigm shifting technology for client side web applications - or GUIs in general for that matter. If you haven't already; give it a try!

One of the things I really like about React is how it lends itself to [TDD](http://en.wikipedia.org/wiki/Test-driven_development) and testing in general. Small, focused components relying mostly on props (parameters) are easy to reason about and requires little mock.

The following are some of my experiences testing React components.

## React Test Utils

React ships with very good test utilities. Unfortunately the documentation is somewhat hidden away on their website. Here is a [link](http://facebook.github.io/react/docs/test-utils.html).

Here is how to require them:

	var React          = require('react')
	var ReactAddons    = require('react/addons')
	var ReactTestUtils = React.addons.TestUtils  // <- YEAH!

## Use jsdom

For any kind of testing to be tolerable, TDD especially, efficient feedback loops are essential. Having to continously pass things off to a browser, or ever worse; multiple browser, is a pain. Luckily we have [nodejs](http://nodejs.org/) & [jsdom](https://github.com/tmpvar/jsdom). The React guys actually use jsdom for their own testing.

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

## Avoid [JSX](http://facebook.github.io/react/docs/jsx-in-depth.html)

It's up to you, but using jsx introduces an additional step everywhere. Just using the React.DOM javascript API is really straight forward.

## Include a common render function

For each test you want a clean slate. Usually this means rendering the component again. It makes sense wrapping the render code into a function.

    var defaultProps = {}

    function render(newProps, callback) {
        var props = _.merge(defaultProps, newProps) // _ is lodash
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
            document.body.innerHTML = ""
            setTimeout(done)
        })

        ...tests...
    })

We use React's <code>React.unmountComponentAtNode</code> to unmount the component. Just to be safe we also reset body's innerHTML. I found again that pushing the current callback to the next tick of the eventloop (using *setTimeout*) once again created a more stable test suite.

## Query

## Simulate


## Running test
I use mocha solely for the [nyancat](http://www.nyan.cat/) reporter.  

	npm install -g mocha

npm test

## Testling

browser field