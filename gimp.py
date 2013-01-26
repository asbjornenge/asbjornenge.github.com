###
# Gimp - Github Markdown Poster
#
###

import sys, os, json
import misaka as m
from mako.template import Template
from mako.lookup import TemplateLookup
mylookup = TemplateLookup(directories=['.'])
gimp_template = """<%inherit file="base.html"/><%block name="content">${content}</%block>"""


def read_config():
    return json.loads(open('gimp.json').read())

def save_config(config):
    open('gimp.json','w').write(json.dumps(config))

def add_blog(config):
    name = len(sys.argv) > 2 and sys.argv[2] or ""
    if name == "":
        print "You have to specify blog name"
        sys.exit(1)
    if not os.path.exists(name):
        os.makedirs(name)
        config['blogs'].append(name)

def build(config):
    build_mako(config)
    build_blog(config)

def build_mako(config):
    # first build an object graph ?? isn't that just config?
    # os.walk('.') to find .mako files and render
    makofiles = []
    mdfiles = []
    for (path, dirs, files) in os.walk('.'):
        for file in files:
            if file.endswith('.mako'):
                makofiles.append('%s/%s' % (path, file))
            if file.endswith('.md'):
                mdfiles.append('%s/%s' % (path, file))
    # for mf in makofiles:
    #     tmpl = Template(filename=mf, lookup=mylookup)
    #     html = tmpl.render()
    #     open(mf.replace('.mako','.html'),'w').write(html)
    for mf in mdfiles:
        content  = m.html(open(mf).read())
        makofile = mf.replace('.md','.mako')
        if (os.path.exists(makofile)):
            template = open(makofile).read()
        else:
            template = gimp_template
        tmpl = Template(template, lookup=mylookup)
        html = tmpl.render(cnt=content)
        open(mf.replace('.md','.html'),'w').write(html)

def build_blog(config):
    # for each blog look for markdown files and render with 
    # inherit=settings.blogparent OR main.blogparent
    return

action_map = {
    'build' : build,
    'blog'  : add_blog
}

if __name__ == "__main__":
    action = len(sys.argv) > 1 and sys.argv[1] or ""
    if action not in action_map.keys():
        print "Unknown action <%s>" % action
        sys.exit(1)
    config = read_config()
    action_map[action](config)
    save_config(config)
