# Thoughts on Code Complexity

First of all let me state that code design patters is a fairly subjective matter. Different people like different abstractions. But, there are some things imho that is hard to disagree with.

## State

AVOID STATEFUL CONSTRUCTS!

### Problem

State is when some part of your application holds a piece of information that other parts of your application depend on to work. Unfortunately this is quite a common with popular Object Oriented patterns. Spreading out state to lots of different parts of your applications is generally a bad idea.

* It makes your logic hard to follow
* It makes your application hard to test
* It makes your application hard to modify

Let consider a very simple python example.

	class MyStatefulClassA:
		def __init__(self):
			self.ready = False
		
		def update(self):
			self.ready = bool(random.randint(0,1))
	
	class MyDependatClassB:
		def __init__(self, a):
			self.a = a

		def test(self, a):
			return self.a.ready and "Yes" or "No"

	a = MyStatefulClassA()
	a.update()
	print "Ready: %s" % MyDependatClassB(a).test()

To write a unit test for our *MyDependatClassB.test* we would first have to instanciate *MyStatefulClassA*. In our example that is easy, but what if *MyStatefulClassA* was very complicated. It might hold a database connection and other complicated things that are hard to mock in a test scenario.

Lets say I want to modify my application by renaming the ready field. I now have to do that in both my classes.

Consider a scenario where both the classes were only imports:

	from here import MyStatefulClassA
	from there import MyDependatClassB

	a = MyStatefulClassA()
	print "Ready: %s" % MyDependatClassB(a).test()

It is not in any way clear what is happening here. To follow the logic one would have to open both files and follow their internal logic while still remembering how they were used.

### Solution

Most applications require some state to be held, but try to keep that state in a single locations. And rather then relying on that state in your application constructs, pass the state to your functions. This will keep your functions pure (only dependant on input) and your logic easier to follow.

Consider a different approach:

	from boolutils import randombool, translatebool

	ready_state = False
	ready_state = randomBool()
	print "Ready: %s" % translateBool(ready_state)
	
Even without displaying the internal logic of our two classes, it is fairly simple to follow this logic. We have a ready_state. We update that state to a random value. We get a translations for our random value. Easy to follow.

As you can see; naming and level of verbosity is also very important. And that brings us to our next consideration; abstractions.

## Abstractions

hidden?

## Domain abstractions

asd
