$(document).ready(function() {

	move_nav_button(window.location.pathname);
	animate_quicklinks(window.location.pathname);

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

function animate_quicklinks(path) {
	if (/^(\/wwc\/)/.test(path)) path = "/"
	switch(path) {
		case '/about.html':
			hide_feed_icons();
			show_social_icons();
			break;
		case '/crly.html':
			hide_feed_icons();
			hide_social_icons();
			break;
		case '/software.html':
			hide_feed_icons();
			hide_social_icons();
			break;
		case '/':
			hide_social_icons();
			show_feed_icons();
			break;
		default:
			console.log('Unknown path '+path);
	}	
}

function position_nav_button(selected) {
	var pos   = selected.position();
	var width = selected.width();
	var left  = $(window).width() - $("#menu").width() + pos.left + (width/2);
	$('#head .nav_selector').css('left',left);
}

/** FEED **/

function show_feed_icons() {
	var feed = $('#feed');
	if (feed.hasClass('shown')) return;
	feed.children().addClass('animated bounceInDown');
	feed.addClass('shown');	
}

function hide_feed_icons() {
	var feed = $('#feed');
	if(!feed.hasClass('shown')) return;
	feed.children().removeClass('bounceInDown').addClass('bounceOutUp');
	setTimeout(function() {
		feed.removeClass("shown");
		feed.children().removeClass('animated bounceOutUp');
	},1000)
}

/** SOCIAL **/

function show_social_icons() {
	var social = $('#social');
	if (social.hasClass('shown')) return;
	social.children().addClass('animated bounceInDown');
	social.addClass('shown');
}

function hide_social_icons() {
	var social = $('#social');
	if(!social.hasClass('shown')) return;
	social.children().removeClass('bounceInDown').addClass('bounceOutUp');
	setTimeout(function() {
		social.removeClass("shown");
		social.children().removeClass('animated bounceOutUp');
	},1000)
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
	var script = $('<script type="text/javascript">setTimeout(function() {animate_quicklinks("'+path+'")},100)</script>');
	new_content.append(script);
	$("#content").replaceWith(new_content);
	// animate_quicklinks(path);
}