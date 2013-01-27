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
	if (tap_event === 'tap') {
		$('a').click(function(e) {
			e.preventDefault();
			window.location = $(this).attr('href');
		})
	}
})