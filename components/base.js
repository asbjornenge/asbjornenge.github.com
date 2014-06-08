var React = require('react')

var Base = React.createClass({
    render : function() {
        return React.DOM.div({
            className : 'test'
        }, 'Version '+this.props.pkg.version)
    }
})

module.exports = Base