# Dock in the clouds
<div class="date">10.06.2014</div>


Tired of having virtualbox and a thousand docker containers dragging your macbook air down in the mud? Put your docker host in the clouds!

In this post we will create a docker host running in the cloud and hook that up to our local development environment using a SSH based "VPN".

Her is a diagram.

        +---------------+               SSH                +----------------+
        |  development  | tun0         tunnel         tun0 |  docker host   |
        |               | <------------------------------->|                |
        |   (client)    | 10.0.0.1                10.0.0.2 | (cloud_server) |
        +-------+-------+     point to point connection    +-------+--------+
           eth0 |                                                  | eth0
    192.168.0.2 |                                                  | 10.0.0.10
                |                    _  _                          | docker0
                |                   ( `   )_                       | 172.17.42.1
                -----------------  (    )    `)  -------------------
                                  (_   (_ .  _) _)
                                      INTERNET

## The Cloud Server

Pick a cloud, any cloud.   

We'll stick with an **Ubuntu 12.04 LTS** on [AWS](http://aws.amazon.com/) EC2, but feel free to choose [digitalocean](https://www.digitalocean.com/) or any other supplier and/or linux distribution. Create your VPS (follow provider instructions) and log in.

	$ ssh <cloud_server_ip>

### Prepare Docker

Follow the appropriate [instructions](http://docs.docker.io/en/latest/installation/) to install docker. By default the docker daemon binds to a unix socket only. To be able to communicate with docker over the network, we need to bind to a network interface.

	$ sudo vi /etc/init/docker.conf
		"$DOCKER" -d $DOCKER_OPTS -H unix:///var/run/docker.sock -H tcp://0.0.0.0:4243

**WARNING!**  Binding to <code>0.0.0.0</code> will expose the docker host on all network interfaces on the server!! **That might not be what you want.** If you only want to talk to the docker host over the tunnel, you can bind to <code>10.0.0.2</code>. Let's keep it like this while we are testing, but remember to go back and fix that later.

### Prepare SSH

To make this work, we need to permit root login over ssh. Now, that might seem like a security hazard. But, we are only going to allow login using keys (not passwords), and later on we are going to limit the access of root over ssh to only run a specific command.

	$ sudo vi /etc/ssh/sshd_config
		PermitRootLogin yes
		PermitTunnel yes
		PasswordAuthentication no # <- optional, but recommended!
	$ sudo service ssh restart

**Friendly tip:** *When modifying sshd_config and restarting the ssh service; test your new configuration on a different session/terminal, keeping the one you already have open, just in case you messed up something.*

We also need to remove any initial scripting under root's ***autorized_keys*** added to prevent login as root.

	$ sudo vi /root/.ssh/authorized_keys

Remove anything resembling the following:
  
	no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo 'Please login as the user \"ubuntu\" rather than the user \"root\".';echo;sleep 10"

...so that your file starts with <code>rsa-ssh \<long_key\></code>.

### Permit forwarding

	$ sudo su -c "echo 1 > /proc/sys/net/ipv4/ip_forward"

## The Client

If your on OSX (like me); install [tuntap](http://tuntaposx.sourceforge.net/).  

Grab the docker client!

	$ curl https://get.docker.io/builds/Darwin/x86_64/docker-latest -o docker
	$ chmod +x docker
	$ sudo cp docker /usr/local/bin/

Thats it!

## Connecting

Connection to your docker host is as simple as:

	(client) $ sudo ssh -w 0:0 -i key.pem root@<cloud_server_ip>

Passing the <code>-w</code> flag to <code>ssh</code> will have ssh create a tunnel device on each end of the connection. The <code>0:0</code> indicates which tunnel device at each end. Since we have specified 0 at each end, both the device on the server and the client will be <code>tun0</code>. Now we need to route some traffic so we can talk to docker on the server.

## Tunnels & Routes & Docker

Setup the tunnel devices:

	(server) $ sudo ifconfig tun0 10.0.0.2 pointopoint 10.0.0.1
	(client) $ sudo ifconfig tun0 10.0.0.1 10.0.0.2
	(client) $ ping 10.0.0.2
	PING 10.0.0.2 (10.0.0.2): 56 data bytes
	64 bytes from 10.0.0.2: icmp_seq=0 ttl=64 time=58.643 ms
	64 bytes from 10.0.0.2: icmp_seq=1 ttl=64 time=58.410 ms
	64 bytes from 10.0.0.2: icmp_seq=2 ttl=64 time=58.586 ms
	^ woohoo!

Setup routing:

	(client) $ sudo route -n add -net 10.0.0.0 10.0.0.2
	(client) $ sudo route -n add -net 172.0.0.0 10.0.0.2

Set the docker host:

	(client) $ export DOCKER_HOST=tcp://172.17.42.1:4243

Et voilà:

	(client) $ docker ps
	CONTAINER ID        IMAGE                           COMMAND                CREATED             STATUS              PORTS

![OHHHH](http://gifs.joelglovier.com/ohhh/ohhh-minion.gif)

## Addtional setup & security

Now, all this is quite a bit to remember, so I definately recommend scripting parts of the setup. One neat thing you can do that will both simplify the process and strengthen security is to only allow root to run a specific command over ssh, and have that command be opening the tunnel.

First, add the <code>tun0</code> interface to <code>/etc/network/interfaces</code>

	$ sudo vi /etc/network/interfaces
	    iface tun0 inet static
		   address 10.0.0.2
		   pointopoint 10.0.0.1
		   netmask 255.255.255.0
		   # Forward traffic into server side network
		   iptables -t nat -A POSTROUTING --source 10.0.0.2 -j SNAT --to-source 10.0.0.10

Add a command to root's <code>authorized_keys</code> (first thing in the file) to bring up the interface on connection.

	$ sudo vi /root/.ssh/authorized_keys
	    tunnel="0",command="/sbin/ifdown tun0;/sbin/ifup tun0" ssh-rsa ....

Only allow commands for root over ssh.

	$ sudo vi /etc/ssh/sshd_config
	    PermitRootLogin forced-commands-only
	$ sudo service ssh restart

Now, whenever you ssh in as root the server will try to bring up the tunnel interface.

## DNS

If you want simple dns based service discovery for you containers over you new cloud bridge, apply the same tools and techniques discussed in my previous article [Vagrant Skydocking](/wwc/vagrant_skydocking.html) to this cloud bridge. You will be pinging <code>redis.staging.yourapp</code> in no time.

## Closing thoughts

I have been applying this technique for connecting to different VPCs I manage on amazon. Once scripted it's really nice being able to connect to a specific environment with one command and be hands on the docker host(s) and the containers in that environment.

Originally I had been hoping to also use a VPC for development purposes. Unfortunately the latency from my location to the datacenter gets annoying when trying to get efficient feedback loops. This is however not a fault of this approach, but the distance from me to the datacenter. Your milage may vary. Setting up a development host closer to home did the trick.

Time to dance!

![DANCE](http://gifs.joelglovier.com/epic/calvin-hobbes-dance.gif)

## Credits

♥ goes out to ssh.  
And all the amazing unix hackers out there!  
Including the authors of [this](http://www.debian-administration.org/article/539/Setting_up_a_Layer_3_tunneling_VPN_with_using_OpenSSH) and [that](http://wouter.horre.be/doc/vpn-over-ssh).  
Gifs from [here](http://gifs.joelglovier.com/).  
Thank you internet of folks!