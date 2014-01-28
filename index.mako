<%inherit file="base.html"/>
<%block name="content">
	<% wwc = config['wwc'] %>
  <% sorted = config['wwc_sorted'] %>
	% for blog in sorted:
		<% post = wwc[blog['key']] %>
		% if post['published']:
			${showblog(wwc[blog['key']])}
		% endif
	% endfor
</%block>

<%def name="showblog(post)">
    <div id="${post['id']}">
    	${post['markdown']}
    </div>
</%def>