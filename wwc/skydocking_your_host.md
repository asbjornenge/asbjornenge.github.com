# Skydocking your host

## A bridge over troubled water

I've been working quite a bit with [docker](http://docker.io) lately. If you haven't yet checked it out; it's about time. Docker is already popping paradigms.

Since I'm on OSX I'm running my docker host on Virtualbox via [Vagrant](http://www.vagrantup.com/).

Instead of having to forward ports and using lots of -p flags when spawning containers I wanted to bridge my host with the docker interface (inside virtualbox) so that I could ping my containers "directly" from my OSX terminal.

First; bind the docker daemon to a specific ip using the **-bip** setting.

	$> vi /etc/init/docker.conf # <- ubuntu
	 $DOCKER_OPTS -bip 10.2.0.10/16
	 
Create a network bridge in your Vagrantfile using the same ip.

	Vagrant::VERSION >= "1.1.0" and Vagrant.configure("2") do |config|
		config.vm.network "private_network", ip: "10.2.0.10", netmask: "255.255.0.0"
		config.vm.provider :virtualbox do |vb|
			vb.customize ["modifyvm", :id, "--nicpromisc2", "allow-all"]
		end
	end

The **vb.customize** is to allow forwarding packets for the bridge interface. The **--nicpromisc2** translates to "Promiscuous mode for nic 2", where nic2 -> eth1. So --nocpromisc3 would change that setting for eth2, etc.

After reloading vagrant, inside the container, we need to link the bridge interface (eth1 <- might differ in your vm) to the docker interface (docker0).

	$> sudo ip addr del 10.2.0.10/16 dev eth1
	$> sudo ip link set eth1 master docker0
	
You now have a bridge from your host to your docker network!

	$> IP=`sudo docker inspect -format='{{.NetworkSettings.IPAddress}}' 5aa2a5199204`
	$> ping $IP
	PING 10.2.0.7 (10.2.0.7) 56(84) bytes of data.
	64 bytes from 10.2.0.7: icmp_req=1 ttl=64 time=0.232 ms
	64 bytes from 10.2.0.7: icmp_req=2 ttl=64 time=0.103 ms
	^C
	--- 10.2.0.7 ping statistics ---
	2 packets transmitted, 2 received, 0% packet loss, time 1009ms
	rtt min/avg/max/mdev = 0.103/0.167/0.232/0.065 ms

Aha!

![AHA](https://raw2.github.com/jglovier/gifs/gh-pages/aha/aha.gif)

## Skydock

Docker is all about distributed systems; packing single components inside containers and have them talk to eachother. One of the painpoints when shattering your monolith is linking all those loose components together.

(Docker provides a -link parameter for linking containers. But this quickly falls short in complex scenarios.)

I was just about to dig into service discrovery solutions like [etcd](https://github.com/coreos/etcd) or similar, when [Michael Crosby](http://crosbymichael.com/) posted his [skydock](https://github.com/crosbymichael/skydock) ([video](https://www.youtube.com/watch?v=Nw42q1ofrV0)). It's brilliant!

So, with skydock my containers can discover eachother via DNS. Awesome! But, especially for development, it would be really nice if I could use these names directly from my host (OSX).

	curl elasticsearch.dev.domain.com:9200 # <- me want!

## Credits

I followed [this](Integrate Docker Containers into your Host Network) guide by [Lukas Pustina](https://twitter.com/drivebytesting) to set up my networking.