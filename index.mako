<%inherit file="base.html"/>
<%block name="content">
	<%
		import time, copy
		wwc = [post for post in copy.deepcopy(config['wwc']) if post['published']]
		wwc.sort(key=lambda item:time.strptime(item['published'],'%d.%m.%Y'), reverse=True)
	%>
    <div class="previews">
	% for post in wwc:
		${showblogpreview(post)}
	% endfor
    </div>
</%block>

<%def name="showblogpreview(post)">
    <div id="${post['id']}" class="preview">
        <div class="previewDate">${post['published']}</div>
        % if post.has_key('previewImage'):
            <div class="previewImageBox" style="background-image:url(${post['previewImage']})"></div>
        % endif
        <h3 class="title"><a href="${post['html']}">${post['title']}</a></h3>
        <p>${post.has_key('preview') and post['preview'] or ''}</p>
    </div>
</%def>

<%def name="showblog(post)">
    <div id="${post['id']}">
    	${post['markdown']}
    </div>
</%def>