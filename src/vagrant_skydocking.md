# [Vagrant skydocking](/wwc/vagrant_skydocking.html)
<div class="date">29.01.2014</div>

*UPDATED 30.01.2014* - Using a **route** instead of **linking** interfaces. A bit simpler. Original [here](/wwc/vagrant_skydocking_link.html).

## A bridge over vagrant water

I've been working quite a bit with [docker](http://docker.io) lately. If you haven't yet checked it out, it's about time. Docker is already popping paradigms.

Since I'm on OSX I'm running my docker host on Virtualbox via [Vagrant](http://www.vagrantup.com/).

Instead of having to forward ports and using lots of -p args when spawning containers, I wanted to bridge my host and the vm's docker interface, so that I could ping my containers from my OSX terminal.

Create a **private_network** in your Vagrantfile. I'm picking an ip on a different subnet than the docker0 interface to avoid any potential conflicts.

	Vagrant::VERSION >= "1.1.0" and Vagrant.configure("2") do |config|
		config.vm.network "private_network", ip: "10.2.0.10", netmask: "255.255.0.0"
		config.vm.provider :virtualbox do |vb|
			vb.customize ["modifyvm", :id, "--nicpromisc2", "allow-all"]
		end
	end

The *vb.customize* is to allow forwarding packets for the bridge interface. The *--nicpromisc2* translates to *Promiscuous mode for nic2*, where nic2 -> eth1. So --nocpromisc3 would change that setting for eth2, etc.

After reloading vagrant we need create a **route** on the host. Basically, any traffic trying to reach the docker subnet (172.17.0.0) should be routed to our new interface inside the vm (10.2.0.10).

	# OSX
	$> sudo route -n add -net 172.17.0.0 10.2.0.10
	# Linux (untested)
	$> sudo route -net 172.17.0.0 netmask 255.255.0.0 gw 10.2.0.10
	
You now have a **bridge** from your host to your docker network!!

	$> IP=`docker inspect -format='{{.NetworkSettings.IPAddress}}' skydns`
	$> ping $IP
	PING 172.17.0.3 (172.17.0.3) 56(84) bytes of data.
	64 bytes from 172.17.0.3: icmp_req=1 ttl=64 time=0.232 ms
	64 bytes from 172.17.0.3: icmp_req=2 ttl=64 time=0.103 ms
	^C
	--- 172.17.0.3 ping statistics ---
	2 packets transmitted, 2 received, 0% packet loss, time 1009ms
	rtt min/avg/max/mdev = 0.103/0.167/0.232/0.065 ms

![AHA](https://raw2.github.com/jglovier/gifs/gh-pages/aha/aha.gif)

## Skydock

Docker is all about distributed systems; packing single components inside containers and have them talk to eachother. One of the painpoints when shattering your monolith is linking all those loose components together.

(Docker provides a -link parameter for linking containers. But this quickly falls short in complex scenarios.)

I was just about to dig into service discrovery solutions like [etcd](https://github.com/coreos/etcd) or similar, when [Michael Crosby](http://crosbymichael.com/) posted his [skydock](https://github.com/crosbymichael/skydock) ([video](https://www.youtube.com/watch?v=Nw42q1ofrV0)). It's brilliant! It let's you discover your services via **DNS**. I won't go into setting up skydock, just check out the awesome [tutorial](https://github.com/crosbymichael/skydock) by Michael.

So, with skydock my containers can discover eachother via DNS names like **myservice.env.domain.com**. Awesome! But, with my network bridge set up, so can my host!! No? That would be really nice for development...

	$> curl elasticsearch.dev.domain.com:9200
	curl: (6) Could not resolve host: elasticsearch.dev.domain.com

﴾͡๏̯͡๏﴿ ... Ah, we need to hook up skydns as a nameserver. This is where I stray a little from Michael's skydock tutorial. I had some issues binding to the docker0 interface (docker v0.7.6), so instead I'm using the skydns container as the nameserver directly (PS! this requires passing a -dns <skydns_ip> arg to each new container). Either way, we have to edit resolv.conf.

	$> sudo vi /etc/resolv.conf
	   # nameserver 172.17.42.1 <- skydock tutorial
	   nameserver 172.17.0.3 # <- skydns container ip
	$> dig elasticsearch.dev.domain.com
	;; ANSWER SECTION:
	elasticsearch.dev.domain.com.	20	IN	A	172.17.0.7

✌(-‿-)✌ ... Hoplah! Now, hopefully that will be it for you and you're all set to curl containers from the comforts of your host terminal! I however, had one more issue to solve...

	$> curl elasticsearch.dev.domain.com:9200
	curl: (6) Could not resolve host: elasticsearch.dev.domain.com # w00000000t???

### OSX weirdness

Apparently OSX is rather weird in how it handles DNS. **dig**, **host**, etc. can resolve the host just fine, but other tools like **curl** and even **ping** does not obey resolv.conf. I eventually stumbled across the issue and found [this](https://github.com/michthom/AlwaysAppendSearchDomains) script that apparently solves it for most people. It didn't help. Eventually I added the DNS server via OSX [network preferences](http://support.apple.com/kb/PH14159), and that did the trick.

	$> curl elasticsearch.dev.domain.com:9200
	{
  		"ok" : true,
  		"status" : 200,
  		"name" : "Damian, Margo",
  		"version" : {
    		"number" : "1.0.0.Beta2",
    		"build_hash" : "296cfbe390dc51bb00c00ba48ad0c8a9efabcfe9",
    		"build_timestamp" : "2013-12-02T15:46:27Z",
    		"build_snapshot" : false,
    		"lucene_version" : "4.6"
  		},
  		"tagline" : "You Know, for Search"
	}

![HAPPY](http://i0.kym-cdn.com/profiles/icons/big/000/055/347/1313845263510.gif)

I'm now a ᕙ༼ຈل͜ຈ༽ᕗ curl’er of containers!!

## Credits

[Docker](http://docker.io), [Skydock](https://github.com/crosbymichael/skydock) and [Skydns](https://github.com/skynetservices/skydns) all deserve a big fat ♥.  
I followed [this](https://blog.codecentric.de/en/2014/01/docker-networking-made-simple-3-ways-connect-lxc-containers/) guide by [Lukas Pustina](https://twitter.com/drivebytesting) to set up my vagrant networking.  
Gifs from [here](https://github.com/jglovier/gifs) and faces from [there](https://github.com/maxogden/cool-ascii-faces).  
Thanks!