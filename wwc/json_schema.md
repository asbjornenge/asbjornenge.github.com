# JSON Schema Validation

Your probably talking JSON with a RESTful api, right?  
If you care about creating a great experience, you need to take error handling seriously. Handling timeouts and http error codes is pretty straight forward, but handling corrupt data can be tricky. It often leaves an ugly footprint in your code. Lot's of **if**'s and **hasOwnProperty**'s. Instead, using [json-schema](http://json-schema.org), you can validate your JSON data first and be sure it is as expected.

## JSON-Schema

>  A JSON Media Type for Describing the Structure and Meaning of JSON Documents

Example; If you have some JSON Data:

	{
		"title" : "Kapsokisio"
	}


You can define a corresponding JSON Schema:

	{
		"type" : "object",
		"required" : ["title"]
		"properties" : {
			"title" : { "type" : "string" } 
		}
	}

You can validate your data using that schema. If it is valid, you can be sure this data is an object with a title property of type string.

### Specification

The latest [IETF](http://www.ieft.org) draft is currently [v3](http://tools.ietf.org/html/draft-zyp-json-schema-03), but they have a v4 "*…being prepared for submission in early 2013*". **This post will focus on v4**.

### Software

There is a variety of [implementations](http://json-schema.org/implementations.html) available. Since I choose to focus on v4 and since I'm a webnerd, **I'll be using the [tv4](https://github.com/geraintluff/tv4) validator for the examples**.

## Usage

**NB!** This article is in no way a usage reference!!  
It's more a collection of the things I stubled across trying to figure out how this JSON-Schema thing works. Some important bits, and some of the things I found really useful. See the [further reading](#further) section for more possibilites and options.

### *type*

Using "type" you can specify the datatype required for the current object. The value can be a string or an array. Available values are; **object, array, string, boolean, integer, number, null**. The following requires the data to be either an object or a string.

	{
		"type" : ["object","string"]
	}
	
	tv4.validate({}, schema) => true
	tv4.validate([], schema) => false

### *enum*

Using "enum" you can define an array with elements of any type. Data must be equal to one of the elements to validate.

	{
		"enum" : [[1,true,0], {}, 28, "Burbon"]
	}
	
	tv4.validate([1,true,0], schema) => true
	tv4.validate(34, schema) => false
	
### *required*

Using "required" you can define an array of required properties. It's value is an array of strings.

	{
		"required" : ["title","origin"]
	}
	
	tv4.validate({"title" : "", "origin" : ""}, schema) => true
	tv4.validate({"title" : ""}, schema) => false

### *properties*

Using "properties" you can further specify an objects properties. It is an object where each value is a separate schema.

	{
		"properties" : {
			"title"   : { "type" : "string" },
			"weight"  : { "type" : "number" }
		}
	}

	tv4.validate({"title" : "", "weight" : 2}, schema) => true
	tv4.validate({"title" : "", "weight" : "2"}, schema) => false

### *items*

Using "items" you can specify the requirements for the items in an array. It can be a single schema or an array of schemas. The following requires the elements in this array to be a string or an object.

	{
		items : [
			{ "type" : "string" },
			{ "type" : "object" }
		]
	}
	
	tv4.validate(["",{}], schema) => true
	tv4.validate(["",true], schema) => false

### *pattern*

Using "pattern" you can validate using regular expressions. Powerful stuff!

	{
		"properties" : {
			"url" : { "type" : "string", "pattern" : /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/ }
		}
	}
	
	tv4.validate({"url" : "http://google.com"}, schema) => true
	tv4.validate({"url" : "htt:/googleco.m"}, schema) => false

### *$ref*

Using "$ref" you can reference other schemas. You can use a URI or an # for internal referencing. Using *definitions* as a location for your internal referenced schemas is not a rule but a common practice.

	{
		"items" : { 
			"$ref" : "#/definitions/bean"
		},
    	"definitions" : {
    		"bean" : {
    			"type" : "object",
    			"required" : ["origin"],
    			"properties" : {
    				"origin" : { "enum" : ["kenya","rawanda"] }
    			}
    		}
    	}
    }
    
    tv4.validate([{"origin" : "kenya"}], schema) => true
    tv4.validate([{"origin" : "brazil"}], schema) => false
    tv4.validate(["kenya","rawanda"], schema) => false

### *allOf*

Using "allOf" you can define an array of schemas where your data elements must validate against all of them.

	{
		"allOf" : [
			{ "type" : "integer" },
			{ "minimum" : 6 }
		]
	}
	
	tv4.validate(6, schema) => true
	tv4.validate(5, schema) => false
	
### *oneOf*

Using "oneOf" you can define an array of schemas where your data elements must validate against one (and only one) of them.

	{
		"oneOf" : [
			{ "type"    : "integer" },
			{ "minimum" : 6 }
		]
	}
	
	tv4.validate(5, schema) => true
	tv4.validate(6, schema) => false
	
### *anyOf*

Using "anyOf" you can define an array of schemas where your data elements can validate against any (at least one) of them.

	{
		"anyOf" : [
			{ "type"    : "integer"  },
			{ "minimum" : 6 }
		]
	}
	
	tv4.validate(5, schema) => true
	tv4.validate(6, schema) => true

### *not*

Using "not" you can define a schema your data elements should to not validate against.

	{
		"not" : { "type" : "string" }
	}
	
	tv4.validate(1, schema) => true
	tv4.validate("test", schema) => false


### Error handling
**(tv4 specific)**

I just thought I'd quickly mention how tv4 handles a failure:

	tv4.validate([],{"type" : "object"})
	var err = tv4.error
	while(err != null) {
		console.log(err.message, err.schemaPath, err.dataPath)
		err = err.subErrors
	}

## <a id="further"></a>Further reading

I would really recommend reading through the [tests for tv4](https://github.com/geraintluff/tv4/tree/master/tests/tests), they provide excellent usage examples for the different possibilites. On the JSON-Schema [website](http://json-schema.org/) you will find the [documentation](http://json-schema.org/documentation.html) and some great [examples](http://json-schema.org/example2.html).

## Pros

One of the biggest benefits of using JSON-Schema validation is that it will allow you a cleaner codebase. You can trust your data. That in turn improves readability and maintainability which leads to better and more robust applications. In the end; a better user experience.

## Cons

It can be quite tideous building a good schema describing your data. And of course, if you change your data structures, you need to update your schema (in addition to your code). But considering how this approach will simplify your codebase, I would definately say it's well worth it.

# Real world example

**Data**

	{
		"title"   : "Kapsokisio",
		"origin"  : "Kenya",
		"variety" : ["SL28","SL34","Burbon"],
		"process" : "Washed",
		"roast" : {
			"level" : 4,
			"date"  : "08.02.2012"
		},
		"bag" : {
			"weight" : 354,
			"date"   : "08.02.2012"
		},
		"brew_tip" : {
			"method" : "pourover",
			"grind"  : "medium",
			"vessle" : "chemex"
		}
	}

**Schema**

	{
		"type" : "object",
		"required" : ["title","origin","variety","process","roast","bag"],
		"properties" : {
			"title"    : { "type" : "string"  },
			"origin"   : { "type" : "string"  },
			"variety"  : { "type" : "array"   },
			"process"  : { "type" : "string" },
			"bag"      : { "$ref" : "#/definitions/bag" },
			"roast"    : { "$ref" : "#/definitions/roast" },
			"brew_tip" : { "$ref" : "#/definitions/brew_tip" }
		},
		"definitions" : {
			"roast" : {
				"type" : "object",
				"required" : ["level", "date"],
				"properties" : {
					"level" : { "type" : "integer" },
					"date"  : { 
						"type" : "string", 
						"pattern" : /^\d{2}([./-])\d{2}\1\d{4}$/
					}
				}
			},
			"bag" : {
				"type" : "object",
				"required" : ["weight", "date"],
				"properties" : {
					"weight" : { "type" : "number" },
					"date"   : { 
						"type" : "string", 
						"pattern" : /^\d{2}([./-])\d{2}\1\d{4}$/
					}
				}
			},
			"brew_tip" : {
				"type" : "object",
				"required" : ["method","grind","vessle"],
				"properties" : {
					"method" : { "type" : "string" },
					"grind"  : { "type" : "string" },
					"vessel" : { "type" : "string" }
				}
			}
		}
	}