/** MODULES **/

console.log('im here')

// var monitoring     = require('taghub-monitoring')()
// var React          = require('react')
// var emitter        = require('nanoemitter')()
// var StatefulHeader = require('taghub-header').stateful
// var AppSwitcher    = require('taghub-appswitcher')

// /** STYLING **/

// require('./node_modules/taghub-styling/styles/th.sprite.header.styl')
// require('./node_modules/taghub-styling/styles/th.taghub-header.styl')
// require('./node_modules/taghub-styling/styles/th.taghub-appswitcher.styl')
// require('./node_modules/taghub-styling/styles/th.animations.styl')
// require('./node_modules/taghub-header/node_modules/react-datalist/react-datalist.styl')

// /** QUERY DATA **/

// var StandaloneHeader = React.createClass({
//     render : function() {
//         return (
//             React.DOM.div(
//                 {},
//                 [
//                     AppSwitcher({
//                         show              : this.state.showAppSwitcher,
//                         applications      : this.state.applications,
//                         load_applications : false
//                     }),
//                     StatefulHeader({
//                         emitter   : emitter,
//                         setFilter : function(setter) {
//                             emitter.on('set_project', setter)
//                         }
//                     })
//                 ]
//             )
//         )
//     },
//     getInitialState: function() {
//         return {
//             showAppSwitcher : false,
//             applications    : []
//         }
//     },
//     componentDidMount: function() {
//         emitter.on('applications_loaded', function(applications) {
//             this.setState({
//                 applications : applications
//             })
//         }.bind(this))
//         emitter.on("toggle_app_switcher", function() {
//             this.setState({
//                 showAppSwitcher : !this.state.showAppSwitcher
//             })
//         }.bind(this))
//     }
// })

// React.renderComponent(StandaloneHeader({}), document.querySelectorAll('#headerContainer')[0])



