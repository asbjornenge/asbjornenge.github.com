import sys, json


available_actions = ['build']
def read_config():
	return open('gimp.json').read()

if __name__ == "__main__":
	action = len(sys.argv) > 1 and sys.argv[1] or ""
	if action not in available_actions:
		print "Unknown action <%s>" % action
		sys.exit(1)
	config = read_config()
	print config