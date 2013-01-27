$(document).ready(function() {
	// $a.menu.bind();
	switch(window.location.pathname) {
		case '/about.html':
			$('#menu .about').addClass('selected');
			break;
		case '/crly.html':
			$('#menu .crly').addClass('selected');
			break;
		case '/software.html':
			$('#menu .software').addClass('selected');
			break;
		case '/':
			$('#menu .blog').addClass('selected');
			break;
		default:
			console.log('Unknown path '+window.location.pathname);
	}
})

$a = {}

$a.menu = {}

$a.menu.bind = function() {
	$('#menu li').click(function() {
		$('#menu li.selected').removeClass('selected');
		$(this).addClass('selected');
	})
}