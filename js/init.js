$(document).ready(function() {
	// $a.menu.bind();

	move_nav_button(window.location.pathname);

	$('.nav_item').click(function(e) {
		e.preventDefault();
		var path = $(this).attr('link');
		move_nav_button(path);
		load_page(path);
		// window.location = $(this).attr('href');
	})

	window.addEventListener('popstate', function(event) {
		// console.log('popstate fired!');
		console.log(event.state);
		var path = window.location.pathname;
		move_nav_button(path)
		console.log(event.state != null)
		if (event.state != null)
			update_content(path, event.state);
		else
			history.replaceState($('html')[0].outerHTML, null, path);
	});


})
var current_xhr;

function move_nav_button(path) {
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
			console.log('Unknown path '+path);
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
		current_xhr = null;
		update_content(path, data);
		// console.log(data);
		if (window.history != undefined)
			history.pushState(data, null, path)
	})
}

function update_content(path, data) {
	var new_label = $("#label", data).text();
	var old_label = $("#label").text();
	var new_logo  = $("#logo", data).attr('src');
	var old_logo  = $("#logo").attr('src');
	var new_content = $(data).find('.push').parent();
	// console.log(new_label, old_label);
	if (new_label != old_label)
		$("#label").text(new_label);
	if (new_logo != old_logo)
		$("#logo").attr('src', new_logo);
	$("#content").html(new_content);

	// switch(path) {
	// 	case '/about.html':
	// 		break;
	// 	case '/crly.html':
	// 		break;
	// 	case '/software.html':
	// 		break;
	// 	case '/':
	// 		break;
	// 	default:
	// 		console.log('Unknown path '+path);
	// }
}