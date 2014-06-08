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
            <div class="previewImageBox previewLink" style="background-image:url(${post['previewImage']})" link="${post['html']}"></div>
        % endif
        <h3 class="previewLink" link="${post['html']}">${post['title']}</h3>
        <p>${post.has_key('preview') and post['preview'] or ''}</p>
    </div>
</%def>

<%def name="showblog(post)">
    <div id="${post['id']}">
    	${post['markdown']}
    </div>
</%def>