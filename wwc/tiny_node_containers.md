# Tiny node containers
<div class="date">11.03.2014</div>

My favorite language at the moment is javascipt. It's fun & functional!

Since I'm also working quite a bit with [docker](http://docker.io), I've been frustrated with the size of nodejs docker images. A typical node container holds <code>node</code>, <code>npm</code> and all your <code>dependencies</code>. Add a few <code>apt-get</code>'s and your quickly looking at > **500 MB**.

I even started hacking some [Go](http://golang.org/) solely for the ability to compile to a single binary.

Until I found [nexe](https://github.com/crcn/nexe)...

<img src="https://raw.github.com/jglovier/gifs/gh-pages/excited/ace-ventura-dance.gif" />  
<font color="#999">*I can haz javascript aaaand binary???*</font>  

## Building with nexe

Nexe will compile your node app into a single executable binary. No joke! Have a [look](https://github.com/crcn/nexe)!

Since we are now compiling, we need to think about things like *compile target*. Containers run linux. My desktop runs Darwin. A binary compiled on/for Darwin won't be able run inside a container. So, I made a [container](https://index.docker.io/u/asbjornenge/nexe-docker/) for compiling apps with nexe.
 
	docker run -v $(pwd):/app -w /app asbjornenge/nexe-docker -i index.js -o app

### Weird bugs

Granted, nexe is a bit flakey atm. I found two main bugs that I had to work around:

A default package.json somehow messes up the executable.  
***Workaround:*** *I added a build script that will move package.json to pkg.json, build, then move it back.*  

When passing arguments to a comiled binary, there must exist a first argument.  
***Workaround:*** *Just pass a random first argument.*

## Container

When distributing, we can use the simplest container possible, and just add the binary.

	FROM debian:jessie
	ADD app /usr/bin/app
	ENTRYPOINT ["app"]
	
## Diff

I used this approach to build [skylink](https://github.com/asbjornenge/skylink), check out the difference!

	      |   normal  |  nexe
	 ---------------------------
	 size |  640.3 MB | 133.6 MB

## Credits

♥ to the [nexe](https://github.com/crcn/nexe) folks!  
Gif from [here](https://github.com/jglovier/gifs).  
Thanks!
