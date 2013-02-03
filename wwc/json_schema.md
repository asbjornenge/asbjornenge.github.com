# JSON Schema Validation

Your probably pulling & pushing data to and from a JSON RESTful api, right? At least you should be.   
If you care about making a great application, you need to care about error handling. Both on the client and the server side. Handling timeouts and dead API's is easy enough, but handling corrupt data can be kind of hard.
  
Protecting against corrupt data usually leaves an ugly footprint in your code. Lot's of **if**'s and **hasOwnProperty**'s. Instead, using [json-schema](http://json-schema.org), you can validate your JSON data first and be sure it is as expected.

## JSON-Schema

>  A JSON Media Type for Describing the Structure and Meaning of JSON Documents

As usual this is best illustrated by an example. If you have some simple JSON data:

	{
		"title" : "Kapsokisio"
	}


Your corresponding JSON Schema:

	{
		"type" : "object",
		"required" : ["title"]
		"properties" : {
			"title" : { "type" : "string" } 
		}
	}

Validating your data using that schema, you can be sure the data is an object containing a title property of type string.

### Version 4

The latest [IETF](http://www.ieft.org) draft is currently [v3](http://tools.ietf.org/html/draft-zyp-json-schema-03), but they have a v4 "*…being prepared for submission in early 2013*".

This post will focus on **v4**.

## Software

There is a variety of [implementations](http://json-schema.org/implementations.html) available. Since I choose to focus on v4 and since I'm a webnerd, I'll be using the [tv4](https://github.com/geraintluff/tv4) validator for the examples.

## Usage

I'm not going to cover the whole specification here, but I'll highlight a few of the possibilites.

#### *type*

Type defines the datatype required for the current object. Available properties are;

* object
* array
* string
* boolean
* number
* null

The value can be a string or an array.

	{
		"type" : ["object","string"]
	}

This requires the data to be either an object **or** a string.

#### *enum*

Enum can be an array with elements of any type. Data must be equal to one of the elements to validate.

	{
		"enum" : [[1,true,0], {}, 28, 34, "Burbon"]
	}

#### *required* [object]

Required is an array of required properties. It implicitly requires the type object. It needs to be an array of strings.

	{
		"required" : ["title","origin","variety","process"]
	}

#### *properties* [object]

Properties provide a way to further specify an objects properties. It is an object where each value is a separate schema.

	{
		"propeties" : {
			"title"   : { "type" : "string" },
			"origin"  : { "type" : "string" },
			"variety" : { "enum" : [28,34,"Burbon"] }
		}
	}

#### *items* [array]

Items define the items in an array. It can be a single schema or an array of schemas.

	{
		items : [
			{ "type" : "string" },
			{ "type" : "object" }
		]
	}
	
Requires the elements in this array to be a string **or** an object.

#### *pattern* [string]

Pattern allows you to validate using regular expressions.

	{
		"properties" : {
			"url" : { "type" : "string", "pattern" : /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/ }
		}
	}

#### *$ref*

This is a way of referencing other schemas. It requires a URI or an # for self referencing.

	{
		"properties" : {
			"beans" : {
				"type"  : "array",
				"items" : { "$ref" : "#/definitions/bean"}
    		}
    	}
    }

#### *oneOf*

#### Use *definitions*

### More…

*numerics*, string *minLength* *maxLength*

## Furter reading

## Missing

I would like to see better dependency handling.

## Pros

* Cleaner code
* Better maintainability
* Better apps

## Complex example

	{
		"title"   : "Kapsokisio",
		"origin"  : "Kenya",
		"variety" : [SL28,SL34],
		"process" : WASHED,
		"weight"  : { 
		    "amount" : 350, 
		    "unit"   : "g" 
		},
		"roast"   : "light",
		"roasted" : <date>
	}
