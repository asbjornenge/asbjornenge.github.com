$(document).ready(function() {
	$a.menu.bind();
})

$a = {}

$a.menu = {}

$a.menu.bind = function() {
	$('#menu li').click(function() {
		$('#menu li.selected').removeClass('selected');
		$(this).addClass('selected');
	})
}