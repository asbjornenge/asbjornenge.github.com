# Dock in the cloud

Sick of having virtualbox & docker dragging your devbox down in the mud?

This post came as a result of me having way too many containers running locally.

In this post we will create a docker host running in the cloud, hook that up to your local dev box. using a SSH base "VPN".

## The Cloud Server

Pick a cloud, any cloud.

We'll stick with an Ubuntu 12.04 LTS on ec2, but feel free to choose something completely different.

Allow login as root (noly using keys)

	$> sudo vi /root/.ssh/authorized_keys
	# remove -> no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo 'Please login as the user \"ubuntu\" rather than the user \"root\".';echo;sleep 10"

so that it starts with ssh-rsa (your login cert).

Verify sshd_config

	$> sudo vi /etc/ssh/sshd_config
	PermitRootLogin forced-commands-only
	PermitTunnel yes
	$> sudo service ssh restart

Permit ip forwarding

	sudo echo 1 > /proc/sys/net/ipv4/ip_forward

## The Client

OSX - install [tuntap](http://tuntaposx.sourceforge.net/).

## Connecting

	sudo ssh -w 0:0 -i taghubdev.pem root@<ip>

## Tunnels & Routes

Setup the tunnel devices

	$SERVER> ifconfig tun2 10.2.1.1 pointopoint 10.2.1.2
	$CLIENT> sudo ifconfig tun2 10.2.1.2 10.2.1.1
	$CLIENT> ping 10.2.1.1 <- woohoo!

Setup routes

	# Client route
	$CLIENT> sudo route -n add -net 10.2.0.0 10.2.1.1
	# Docker route
	$CLIENT> sudo route -n add -net 172.17.0.0 10.2.1.1

## Auto open tunnel

	iface tun0 inet static
		address 10.0.0.2
		pointopoint 10.0.0.1
		netmask 255.255.255.0
	tunnel="0",command="/sbin/ifdown tun0;/sbin/ifup tun0"

## DNS

