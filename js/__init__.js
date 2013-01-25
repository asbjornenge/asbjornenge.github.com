$(document).ready(function() {
	$('h1').text("Call me to come here with a crooked crescendo, but i don't.");
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