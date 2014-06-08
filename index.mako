<%inherit file="base.html"/>
<%block name="content">
	<%
		import time, copy
		wwc = [post for post in copy.deepcopy(config['wwc']) if post['published']]
		wwc.sort(key=lambda item:time.strptime(item['published'],'%d.%m.%Y'), reverse=True)
	%>
	% for post in wwc:
		${showblogpreview(post)}
	% endfor
</%block>

<%def name="showblogpreview(post)">
    <div id="${post['id']}" class="preview">
        <span class="title">${post['title']}</span><span class="date">${post['published']}</span>
        % if post.has_key('previewImage'):
            <img src="${post['previewImage']}"/>
        % endif
        <p>${post.has_key('preview') and post['preview'] or ''}</p>
    </div>
</%def>

<%def name="showblog(post)">
    <div id="${post['id']}">
    	${post['markdown']}
    </div>
</%def>