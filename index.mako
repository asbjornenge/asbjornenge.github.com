<%inherit file="base.html"/>
<%block name="content">
	<% wwc = config['wwc'] %>
	% for path in wwc:
		<% post = wwc[path] %>
		% if post['published']:
			${showblog(wwc[path])}
		% endif
	% endfor
</%block>

<%def name="showblog(post)">
    <div id="${post['id']}">
    	${post['markdown']}
    </div>
</%def>