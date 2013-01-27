$(document).ready(function() {
	// $a.menu.bind();

	move_nav_button(window.location.pathname);

	$('a').click(function(e) {
		e.preventDefault();
		move_nav_button($(this).attr('href'));
		// window.location = $(this).attr('href');
	})

})

var current_xhr;

function move_nav_button(path) {
	load_page(path)
	switch(path) {
		case '/about.html':
			position_nav_button($('#menu .about'))
			break;
		case '/crly.html':
			position_nav_button($('#menu .crly'))
			break;
		case '/software.html':
			position_nav_button($('#menu .software'))
			break;
		case '/':
			position_nav_button($('#menu .blog'))
			break;
		default:
			console.log('Unknown path '+window.location.pathname);
	}
}

function position_nav_button(selected) {
	var pos   = selected.position();
	var width = selected.width();
	var left  = pos.left + (width/2);
	$('#head .nav_selector').css('left',left);
}

function load_page(path) {
	if (current_xhr != null) current_xhr.abort();
	$('#head .nav_selector').addClass('loading');
	current_xhr = $.get(path, function(data) {
		setTimeout(function() {
			$('#head .nav_selector').removeClass('loading');
		}, 450);
		var nc = $(data).find('.push').parent();
		$("#content").html(nc);
		current_xhr = null;
		if (window.history != undefined)
			history.pushState(null, null, path)
	})
	console.log(current_xhr);
}