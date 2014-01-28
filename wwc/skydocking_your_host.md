# Skydocking your host

## A bridge over vagrant water

I've been working quite a bit with [docker](http://docker.io) lately. If you haven't yet checked it out; it's about time. Docker is already popping paradigms.

Since I'm on OSX I'm running my docker host on Virtualbox via [Vagrant](http://www.vagrantup.com/).

Instead of having to forward ports and using lots of -p args when spawning containers, I wanted to bridge my host with the vm's docker interface, so that I could ping my containers from my OSX terminal.

First; bind the docker daemon to a specific ip using **-bip** arg.

	$> sudo vi /etc/init/docker.conf # <- ubuntu ¯_(ツ)_/¯
	   $DOCKER_OPTS -bip 10.2.0.10/16
	 
Create a **private_network** in your Vagrantfile using the same ip.

	Vagrant::VERSION >= "1.1.0" and Vagrant.configure("2") do |config|
		config.vm.network "private_network", ip: "10.2.0.10", netmask: "255.255.0.0"
		config.vm.provider :virtualbox do |vb|
			vb.customize ["modifyvm", :id, "--nicpromisc2", "allow-all"]
		end
	end

The *vb.customize* is to allow forwarding packets for the bridge interface. The *--nicpromisc2* translates to *Promiscuous mode for nic2*, where nic2 -> eth1. So --nocpromisc3 would change that setting for eth2, etc.

After reloading vagrant we need to **link** the bridge interface, *eth1* (<- might differ in your vm), and the docker interface *docker0*.

	$> sudo ip addr del 10.2.0.10/16 dev eth1
	$> sudo ip link set eth1 master docker0
	
You now have a **bridge** from your host to your docker network!!

	$> IP=`sudo docker inspect -format='{{.NetworkSettings.IPAddress}}' 5aa2a5199204`
	$> ping $IP
	PING 10.2.0.7 (10.2.0.7) 56(84) bytes of data.
	64 bytes from 10.2.0.7: icmp_req=1 ttl=64 time=0.232 ms
	64 bytes from 10.2.0.7: icmp_req=2 ttl=64 time=0.103 ms
	^C
	--- 10.2.0.7 ping statistics ---
	2 packets transmitted, 2 received, 0% packet loss, time 1009ms
	rtt min/avg/max/mdev = 0.103/0.167/0.232/0.065 ms

![AHA](https://raw2.github.com/jglovier/gifs/gh-pages/aha/aha.gif)

## Skydock

Docker is all about distributed systems; packing single components inside containers and have them talk to eachother. One of the painpoints when shattering your monolith is linking all those loose components together.

(Docker provides a -link parameter for linking containers. But this quickly falls short in complex scenarios.)

I was just about to dig into service discrovery solutions like [etcd](https://github.com/coreos/etcd) or similar, when [Michael Crosby](http://crosbymichael.com/) posted his [skydock](https://github.com/crosbymichael/skydock) ([video](https://www.youtube.com/watch?v=Nw42q1ofrV0)). It's brilliant! It basically let's you discover your service via DNS and a few naming conventions. I won't go into setting up skydock, just check out the awesome [tutorial](https://github.com/crosbymichael/skydock) by Michael.

So, with skydock my containers can discover eachother via DNS. Awesome! But, with my network bridge set up, so can my host!! No? That would be really nice for development...

	$> curl elasticsearch.dev.domain.com:9200
	curl: (6) Could not resolve host: elasticsearch.dev.domain.com

﴾͡๏̯͡๏﴿ ... Ah, we need to do is hook up the docker0 interface as a nameserver.

	$> sudo vi /etc/resolv.conf
	   nameserver 10.2.0.10
	$> dig elasticsearch.dev.domain.com
	;; ANSWER SECTION:
	elasticsearch.dev.domain.com.	20	IN	A	10.2.0.7

✌(-‿-)✌ ... Now, hopefull that will be it for you and you're all set to curl containers from the comforts of your host terminal. I however, had one more issue to solve...

	$> curl elasticsearch.dev.domain.com:9200
	curl: (6) Could not resolve host: elasticsearch.dev.domain.com # w00000000t???

### OSX weirdness

Apparently OSX is rather weird in how it handles DNS. **dig**, **host**, etc. can resolve the host just fine, but other tools like **curl** and even **ping** does not obey resolv.conf. I eventually stumbled across the issue and found [this](https://github.com/michthom/AlwaysAppendSearchDomains) script that apparently solves it for most people. It didn't help. I'm on Maverics btw. Eventually I added the DNS server via OSX [network preferences](http://support.apple.com/kb/PH14159) which did the trick.

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
I followed [this](https://blog.codecentric.de/en/2014/01/docker-networking-made-simple-3-ways-connect-lxc-containers/) guide by [Lukas Pustina](https://twitter.com/drivebytesting) to set up my networking.  
Gifs from [here](https://github.com/jglovier/gifs) and faces from [there](https://github.com/maxogden/cool-ascii-faces).  
Thanks!