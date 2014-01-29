<%inherit file="base.html"/>
<%block name="content">
	<%
		import time, copy
		wwc = [post for post in copy.deepcopy(config['wwc']) if post['published']]
		wwc.sort(key=lambda item:time.strptime(item['published'],'%d.%m.%Y'), reverse=True)
	%>
	% for post in wwc:
		${showblog(post)}
	% endfor
</%block>

<%def name="showblog(post)">
    <div id="${post['id']}">
    	${post['markdown']}
    </div>
</%def>