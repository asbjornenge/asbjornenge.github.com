<%inherit file="../base.html"/>
<%block name="content">
	% for blog in cfg['wwc']:
		<h1>${cfg['wwc'][blog]['title']}</h1>
	% endfor
</%block>