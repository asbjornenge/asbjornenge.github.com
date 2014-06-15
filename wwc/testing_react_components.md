# Testing React Components

[React](http://facebook.github.io/react/) offers (imho) a paradigm shifting technology for client web applications - or GUIs in general for that matter. If you haven't; give it a try!

One of the things I really like about it is how it lends itself to [TDD](http://en.wikipedia.org/wiki/Test-driven_development) and testing in general. With small, focused components relying mostly on props (parameters) it is ... easy to reason about ... and requires little mock.

Following are some of my experiences testing React components.

## React Test Utils

React ships with very good test utilities. The documentation is however somewhat hidden away on their website. Here is a [link](http://facebook.github.io/react/docs/test-utils.html).

Here is how to require them:

	var React          = require('react')
	var ReactAddons    = require('react/addons')
	var ReactTestUtils = React.addons.TestUtils  // <- YEAH!


## jsDOM

For any kind of testing to be relevant (TDD especially)

qucik feedback loops

Like any sane Javascript developer I use mocha. It has the nyancat reporter. Nuff said.

For the purpose of reusability and other things, I don't use JSX. And I don't think you should either.

## Testling

browser field