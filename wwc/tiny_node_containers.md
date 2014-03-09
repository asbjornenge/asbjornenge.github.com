# Tiny node containers

My favorite language at the moment is javascipt. It's fun & functional!

Since I'm also working quite a bit with [docker](http://docker.io), I've been quite frustrated with the size of nodejs docker images. Typically to prepare a node container one needs to apt-get install <code>build-essentials</code>, pull the <code>source</code>, compile it and keep <code>node</code>, <code>npm</code> and all <code>dependencies</code> inside the container.

One of the things that made me start looking at [Go](http://golang.org/) was the ability to compile a single binary that can be added to a tiny container and the whole thing would have a minimal footprint.

That was until I found [nexe](https://github.com/crcn/nexe).

<img src="https://raw.github.com/jglovier/gifs/gh-pages/excited/ace-ventura-dance.gif" />  
<font color="#999">*I can haz javascript aaaaaaaaaaaand binary???*</font>  

## Building with nexe

Nexe will compile your node app into a single executable binary. Granted, it's a bit flakey atm, and I had to jump through some hoops to get it working, but man was it worth it!

Since we are now compiling, we need to compile to the correct target. Containers run linux, my desktop runs Darwin. So I made a conatiner for compiling apps with nexe against linux.

	echo "console.log('unicorn')" > index.js && 
	docker run -i -t -v $(pwd):/app -w /app asbjornenge/nexe-docker -i index.js -o app
	
### Weird bugs

I found two main bugs that I had to work around.

1. A default package.json somehow messes up the build.  
***Workaround:*** *I added a build script that will move package.json to pkg.json, build, then move it back.*
2. When passing arguments to a comiled binary, there must exist a first argument.  
***Workaround:*** *Just pass a random first argument.*

## Containers

When distributing these binaries, we can use the simplest container possible and just add the binary.

	FROM debian:jessie
	ADD app /usr/bin/app
	ENTRYPOINT ["app"]
	
## Distributing with nexe

I used this approach to build [skylink](https://github.com/asbjornenge/skylink), check out the difference!

 .. | normal | nexe
-- | -- | --
size  | **730.5 MB** | **132.1 MB**