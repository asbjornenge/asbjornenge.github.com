$(document).ready(function() {

	move_nav_button(window.location.pathname);

	$('.nav_item').click(function(e) {
		e.preventDefault();
		var path = $(this).attr('link');
		move_nav_button(path);
		load_page(path);
		if (window.history != undefined)
			history.pushState("", "", path)
	})

	window.addEventListener('popstate', function(event) {
		var path = window.location.pathname;
		move_nav_button(path)
		if (event.state != null)
			load_page(path);
		else
			history.replaceState("", "", path);
	});

	var resize_timeout;
	$(window).resize(function(){
		clearTimeout(resize_timeout);
		resize_timeout = setTimeout(function(){ move_nav_button(window.location.pathname) }, 300);
	});

})

function move_nav_button(path) {
	if (/^(\/wwc\/)/.test(path)) path = "/"
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

var current_xhr;
var load_animation_timeout;
function load_page(path) {
	if (current_xhr != null) current_xhr.abort();
	clearTimeout(load_animation_timeout);
	$('#head .nav_selector').addClass('loading');
	current_xhr = $.get(path, function(data) {
		load_animation_timeout = setTimeout(function() {
			$('#head .nav_selector').removeClass('loading');
		}, 450);
		current_xhr = null;
		update_content(path, data);
	})
}

function update_content(path, data) {
	var new_label = $("#label", data).text();
	var old_label = $("#label").text();
	var new_logo  = $("#logo", data).attr('src');
	var old_logo  = $("#logo").attr('src');
	var new_content = $(data).find('.push').parent();
	if (new_label != old_label)
		$("#label").text(new_label);
	if (new_logo != old_logo)
		$("#logo").attr('src', new_logo);
	$("#content").replaceWith(new_content);
}