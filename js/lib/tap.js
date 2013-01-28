/** Replacing click with touch if on touch device **/

var tap_event = 'ontouchstart' in window ? 'tap' : 'click';
var touch_moved = false;
var touch_startX, touch_startY;

jQuery.fn.click = function(a,c) {
	if (tap_event == 'tap') {
		this.unbind('touchstart touchmove touchend');
		this.on('touchstart', function(event) {
			touch_startX = event.originalEvent.touches[0].clientX;
			touch_startY = event.originalEvent.touches[0].clientY;
		})
		this.on('touchmove', function(event) {
			var x = event.originalEvent.touches[0].clientX;
			var	y = event.originalEvent.touches[0].clientY;
			//if finger moves more than 10px flag to cancel
			if (Math.abs(x - touch_startX) > 10 || Math.abs(y - touch_startY) > 10) {
				touch_moved = true;
			} else {
				touch_moved = false;
			}
		})
		this.on('touchend', function(event) {
			if (!touch_moved) $(this).trigger('tap');
			touch_moved  = false;
		})
	}
	return c==null && (c=a,a=null), arguments.length>0 ? this.on(tap_event,null,a,c) : this.trigger(tap_event)
}