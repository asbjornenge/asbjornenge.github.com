import sys, os, json

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
    # first build an object graph
    # os.walk('.') to find .mako files and render
    return
def build_blog(config):
    # for each blog look for markdown files and render with 
    # inherit=settings.blogparent OR main.blogparent
    return

action_map = {
    'build' : build,
    'add'   : add_blog
}

if __name__ == "__main__":
    action = len(sys.argv) > 1 and sys.argv[1] or ""
    if action not in action_map.keys():
        print "Unknown action <%s>" % action
        sys.exit(1)
    config = read_config()
    action_map[action](config)
    save_config(config)