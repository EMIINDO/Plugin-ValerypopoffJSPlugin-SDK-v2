"use strict";

	globalThis.IsValidIdentifier = function(name_)
	{	
		var fnNameRegex = /^[$A-Z_][0-9A-Z_$]*$/i;
		return fnNameRegex.test( name_ );
	}

	globalThis.DotStringToDotArray = function( str_ )
	{
		// Array of indexes that will be used to dotsplit the string. Only split by dots that are not in brackets
		// To determine whether the dot is in brackets, we use simple logic:
		// if before the dot there's different amount of '[' and ']', the dot is in brackets 
		
		var SplitArray = [];
		var left = 0;
		var right = 0;

		for( var i=0, str_length=str_.length; i<str_length; i++ )
		{
			if( str_[i] == '[' )
			{
				left++;
				continue;
			}

			if( str_[i] == ']' )
			{
				right++;
				continue;
			}

			if( str_[i] == '.' && (left == right) )
			{
				SplitArray.push(i);
			}
		}
	

		// Split the string using the SplitArray
		// ----------------------------------------------------------------------
		
		var Dotparts = [];
		var splitArrayLengthMinusOne = SplitArray.length-1;
		
		SplitArray.forEach( function(currentValue, index, arr)
		{
			var prevValue = SplitArray[index-1];

			var substr = str_.substring( prevValue+1, currentValue );
			if( substr != "" ) Dotparts.push( substr ); 

			//If this is the last dot, push to dotparts the rest of the string
			if( index == splitArrayLengthMinusOne )
			{
				substr = str_.substring( currentValue+1 );
				if( substr != "" ) Dotparts.push( substr ); 
			}
		});

		// If nothing was added to dotparts (if there was no dots), put the whole string
		if( Dotparts.length == 0 )
		{
			Dotparts.push( str_ )
		}


		
		// Trim every Dotparts element and if this is an array access, go to recursion
		//-------------------------------------------------------------------------------------------
		Dotparts.forEach( function(currentValue, index, arr)
		{ 
			// If this is something like [*]
			if( currentValue[0] == '[' )
			arr[index] = DotStringToDotArray( currentValue.substring(1, currentValue.length-1) ) ;
			
		});

		return Dotparts;
	}
	
	globalThis.HashtagParamsToCode = function(code_, params_)
	{
		// Replace all #0 #1 #3... in the code to the corresponding parameters
		code_ = code_.replace( /#[0-9]+/g, function(str)
												{
													var temp = params_[ str.substr(1) ];
													
													if (typeof temp === "string")
													return "'" + temp + "'";
													else
													return temp;
												} 
									);

		return code_;
	}
	
	globalThis.MakeCallString = function (funcname_,funcparams_)
	{
 		var callstring = funcname_ + "(";
 		
 		if (funcparams_)
		for (var i=0, funcparams_length=funcparams_.length; i<funcparams_length; ++i)
		{
			if (typeof funcparams_[i] === "string")
			callstring = callstring + "'" + funcparams_[i] + "'";
			else
			callstring = callstring + funcparams_[i];

			if( i != funcparams_.length-1 )
			callstring = callstring + ",";					
		}

		callstring = callstring + ")";

		return callstring;
	}

{
	globalThis.C3.Plugins.ValerypopoffJSPlugin.Instance = class ValerypopoffJSPluginInstance extends globalThis.ISDKInstanceBase
	{
		constructor()
		{
			super();

            const properties = this._getInitProperties();
			
			// Backward compatibility for C2 runtime
			this.properties = properties;

					this.returnValue = undefined;

		this.sciptsToLoad = 0;
		this.Aliases = {};
		this.construct_compare_function_prefix = "ConstructCompare_";

		this.AliasDotpartsCache = 
		{
			count: 0,
			max_count: 4096,
			Dotparts: {},
			AliasNames: {},
			AliasTrailers: {},
			IsAlias: {}
		};

		this.NonAliasDotpartsCache =
		{
			count: 0,
			max_count: 2048,
			Dotparts: {}
		};


		// Adds scripts to the page and does all the success handling 
		// On success it decreases the scripts counter (this.sciptsToLoad) so we know that all scripts are loaded if it's zero 
		function AddScriptToPage(this_, nameOfExternalScript)
		{
			if( document === undefined )
			{
				this_.ShowError(
				{
					debug_caller: "Including '"+ nameOfExternalScript +"' script to the page",
					caller_name: "Including '"+ nameOfExternalScript +"' script to the page",              
					error_message: "'document' is not defined. You're probably launching the game in a Worker. Workers are not supported yet. Export project with 'Use worker' option unchecked in the 'Advanced' section of the 'Project properties' panel."
				});

				return;
			}

			//$.ajax is preferable because it automatically makes the whole game wait until scripts are loaded
			//for some reason if it's not jquery, it doesn't wait automatically and you have to check if scripts are loaded 				
			/*
			if( window.jQuery && window.jQuery.ajax )
			{  
 				$.ajax(
 				{  
					url: nameOfExternalScript, 
					dataType: "script", 
					async: false,
					success: function()
					{ 
						this_.sciptsToLoad-- ; 
					},
					error: function(XMLHttpRequest)
					{
						this_.ShowError(
						{
							debug_caller: "Including '"+ nameOfExternalScript +"' script to the page",
							caller_name: "Including '"+ nameOfExternalScript +"' script to the page",              
							error_message: XMLHttpRequest.status
						});
					} 
				});
		    } else  */
			//if jQuery is not presented, load scripts using regular javascript
		    {
				var myScriptTag = document.createElement('script');
				myScriptTag.setAttribute("type","text/javascript");
				myScriptTag.setAttribute("src", nameOfExternalScript);
				myScriptTag.onreadystatechange = function ()
				{
  					if (this.readyState == 'complete') 
  					this_.sciptsToLoad--; 
				}
				myScriptTag.onload = function(){ this_.sciptsToLoad--; };
				myScriptTag.onerror = function()
				{
					this_.ShowError(
					{
						debug_caller: "Including '"+ nameOfExternalScript +"' script to the page",
						caller_name: "Including '"+ nameOfExternalScript +"' script to the page",              
						error_message: "Probably file not found"
					});					
				};

				document.getElementsByTagName("head")[0].appendChild(myScriptTag);
		    }
		}

		//If there's js script files specified, include them into the webpage
		if( this.properties[0] != "" )
		{
			//Script names are separated with '\n' or ';' depending on a Construct version
			var lines = [];

			// Split the string into array of script names
			if( __CONSTRUCT2_RUNTIME2__ )
				lines = this.properties[0].split(';');	
			else
				//lines = this.properties[0].split('\n');
				lines = this.properties[0].split(/[;\n\r]/);
			
			for(var i=0; i<lines.length; i++)
			{
				lines[i] = lines[i].trim();
				//Skip the string if it's empty or contains only spaces
					//var temp = lines[i];
					//if( !temp.replace(/\s/g, '').length )
					//continue;
				if( lines[i].length == 0 )
				{
				   continue;
				} 


				// Increase the scripts counter
				this.sciptsToLoad++;


				if( __CONSTRUCT2_RUNTIME2__ )
				{
					AddScriptToPage(this, lines[i]);
				} 
				
				if( __CONSTRUCT3_RUNTIME2__ )
				{					
					AddScriptToPage(this, this.runtime.getLocalFileUrl( lines[i] ) );
					
				} 
				
				if( __CONSTRUCT3_RUNTIME3__ )
				{
					var this_ = this;
					
					// For Construct3 r116 and higher
					if( this_.runtime.assets.getProjectFileUrl !== undefined )
					{
						this_.runtime.assets.getProjectFileUrl( lines[i] )
						.then(function(url)
						{
							AddScriptToPage(this_, url)
						}, function(err)
						{
							this_.ShowError(
							{
								debug_caller: "Including '"+ lines[i] +"' script to the page",
								caller_name: "Including '"+ lines[i] +"' script to the page",              
								error_message: err.message
							});
						}).catch(function(err)
						{
							this_.ShowError(
							{
								debug_caller: "Including '"+ lines[i] +"' script to the page",
								caller_name: "Including '"+ lines[i] +"' script to the page",              
								error_message: err.message
							});
						})
					}
					// For Construct3 r115 and lower
					else
					{
						AddScriptToPage(this_, this_.runtime.assets.getProjectFileUrl( lines[i] ));
					}
				}
			}
		}
		}
		
		_release()
		{
			super._release();
		}
		
		_saveToJson()
		{
			return {
				// data to be saved for savegames
			};
		}
		
		_loadFromJson(o)
		{
			// load state for savegames
		}
	};


	var InstanceFunctionsObject = {
	Value( caller_name_, params_ )
    {
	    //- C2-C3 COMPATIBILITY -------------------------
	    /*
	    var params_ = Array.prototype.slice.call(arguments);
	    var ret;

	    if( __CONSTRUCT3_RUNTIME3__ )
	    	ret = {set_int: function(){}, set_float: function(){}, set_string: function(){}, set_any: function(){}};
		else
		{
			ret = params_[0];

	        for( var i=0; i<params_.length-1; i++ ) 
	        params_[i] = params_[i+1];

	    	params_.pop();
		}
		//----------------------------------------------
		*/
	    
		var alias_exp_ = params_[0];
		params_.splice(0, 1);
		
        //var caller_name_ = "'Value' expression";
		var store_return_value_ = false;
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
        // If no such alias
        /*
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "Value",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
 
            ret.set_any( undefined );
            return;         
        }*/
 
        // If there was an error during parse-resolve
        if( final.error )
        {
            ret.set_any( undefined );
            return;
        }   
 
 
         
        var jsret = undefined;
        try
        {
            jsret = final.end;
 
        } catch(err)
        {
            var info = 
            {
                debug_caller: "Value",
                caller_name: caller_name_,
                "show-alias-expression": final.alias_found,
                alias_expression: final.trimmed_code,
                //"show-code": true,
                //code: code,           
                error_message: err.message
            }
 
            this.ShowError( info );
 
 
            ret.set_any( undefined );
            return;         
        } 


		if( typeof final.end == "function" )
	        jsret = this.CallJSfunction(alias_exp_, params_, store_return_value_, caller_name_, final );



 
        return jsret;
    },

	CallJSfunction: function(funcname_, funcparams_, store_return_value_, caller_name_, final_)
    {
        //If no store_return_value_ passed, make it true
        if( store_return_value_ === undefined )
        store_return_value_ = true;
 
        //If no caller_name_ passed, make it "'Call function' action"
        if( caller_name_ === undefined )
        caller_name_ = "'Call function' action";
 
        // Only parse if parsed result is not passed to the function
        // If it's passed, then it must have been parsed in the CallAlias action
        if( final_ === undefined )
        var final = this.ParseJS( funcname_, true, caller_name_ );
        else
        var final = final_;
         
        // Parse-resolve error
        if( final.error )
        {
            return;
        }
 
 
        //If a function name contains parenthes, shoot an error
        if( funcname_.indexOf("(") >= 0 || funcname_.indexOf(")") >= 0 )
        {
            var info = 
            {
                debug_caller: "CallJSfunction",
                caller_name: caller_name_,              
                error_message: "'" + final.trimmed_code + "' must be a function name, not a function call. Remove parentheses."
            }
 
            if( final.alias_found )
            {
                info["show-alias-expression"] = true;
                info.alias_expression = final.trimmed_code;
            }
             
            this.ShowError( info );
            return;
        }
 
 
 
 
        var ret = undefined;
 
        try
        {
            ret = final.end.apply(final.context, funcparams_);
 
        } catch(err)
        {
             
            if (err instanceof TypeError && err.message.indexOf("apply") >= 0 && err.message.indexOf("undefined") >= 0 )
            err.message = funcname_ + " is undefined";
             
 
            var info = 
            {
                debug_caller: "CallJSfunction",
                caller_name: caller_name_,
                error_message: err.message
            }
             
 
            if( final.alias_found )
            {
                info["show-alias-expression"] = true;
                info.alias_expression = MakeCallString(final.trimmed_code, funcparams_);
                info["show-code"] = true,
                info.code = MakeCallString(this.Aliases[final.alias_name].js + final.alias_trailer, funcparams_);
            }
            else
            {
                info["show-code"] = true,
                info.code = MakeCallString(final.trimmed_code, funcparams_);
            }
 
 
            this.ShowError( info );
            return;
        } 
 
        //Only store return value if the flag is true
        if( store_return_value_ )
        this.returnValue = ret;
  
        return ret;
    },

	CallAlias: function(alias_exp_, funcparams_, store_return_value_, caller_name_)
    {
        //If no store_return_value_ passed, make it true
        if( store_return_value_ === undefined )
        store_return_value_ = true;
 
        //If no caller_name_ passed, make it "'Call function' action"
        if( caller_name_ === undefined )
        caller_name_ = "'Call alias' action";
 
 
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
         
        // If no such alias
        /*
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "CallAlias",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
            return;         
        }
        */
     
        // If there was an error during parse-resolve
        if( final.error )
        return;
 
 
        var ret = this.CallJSfunction(this.Aliases[final.alias_name].js + final.alias_trailer, funcparams_, store_return_value_, caller_name_, final );
         
        return ret;
    },

	ShowError: function( info )
	{

		var error_str = "ValerypopoffJS plugin: Error in " + info.caller_name + "\n";
		error_str += "--------------------- \n";


		if( __DEBUG__ )
		{
			error_str += "DEBUG CALLER: " + info.debug_caller + "\n";
			error_str += "--------------------- \n";
		}

		if( info["show-alias-expression"] )
		{
			error_str += "Alias expression: " + info.alias_expression + "\n";
			error_str += "--------------------- \n";
		}

		if( info["show-code"] )
		{
			error_str += "JS code: " + info.code + "\n";
			error_str += "--------------------- \n";
		}		
		
		error_str += info.error_message;

		console.error( error_str );	
	},
	
	Resolve: function( dotparts_, caller_name_, code_, alias_name_, alias_trailer_ )
	{
		var context = window;
		var end = context;
		var endname = "";
		//var prevname = "";

		for( var i=0, dotparts_length=dotparts_.length; i<dotparts_length; i++ )
		{
			endname = dotparts_[i];

			if( typeof(endname) == "object" )
			{
				var temp = this.Resolve( endname, caller_name_, code_, alias_name_, alias_trailer_ );

				if( temp.error ) return {error: true}				
					
				endname = temp.end;


				try
				{
					end = end[endname];
				}
				catch(err)
				{
					//if (err instanceof TypeError)
			 		//err.message = prevname + " is undefined";
				 	var info = 
				 	{
				 		debug_caller: "Resolve",
				 		caller_name: caller_name_,		 		
				 		error_message: err.message,
				 		"show-code": true,
				 		code: code_
				 	}

				 	if( alias_name_ )
				 	{
				 		info["show-alias-expression"] = true;
				 		info.code = this.Aliases[alias_name_].js + alias_trailer_;
				 		info.alias_expression = code_;
				 	}

				 	this.ShowError( info );
					return {error: true}
				}	

			} else
			{
				try
				{
					// Optimization
					// We only need to check if it's a valid identifier if the context is window. Because a non-identifier 
					// can only be in brackets. And when resolving the brackets contents, the context is always window
					if(context == window)
					{
						// If endname is not an identidifier, then it's a string or a number. Then it must be in [brackets]. 
						// In this case, the result of endname resolving IS an endname itself
						// In other words, you don't calculate 4 in [4] or 'something' in ['something']. 
						// You just use it as a string-index to acces an object or an array item
						if( !IsValidIdentifier(endname) )
						{
							// If this is a string in 'quotes', remove quotes, 
							// Optimization
							// if( endname[0] == '\'' ) plus substring is 14% faster than
							// endname = endname.replace(/'/g, "");
							if( endname[0] == '\'' )
							endname = endname.substring(1, endname.length-1);

							end = endname;
						}
						else
						{
							end = end[endname];
						}
					}
					else
					{
						end = end[endname];
					}

				}
				catch(err)
				{
					//if (err instanceof TypeError)
			 		//err.message = prevname + " is undefined";

				 	var info = 
				 	{
				 		debug_caller: "Resolve",
				 		caller_name: caller_name_,		 		
				 		error_message: err.message,
				 		"show-code": true,
				 		code: code_
				 	}

				 	if( alias_name_ )
				 	{
				 		info["show-alias-expression"] = true;
				 		info.code = this.Aliases[alias_name_].js + alias_trailer_;
				 		info.alias_expression = code_;
				 	}

				 	this.ShowError( info );
					return {error: true}
				}	
			}

			//prevname = endname;			


			if( i<dotparts_length-1 )
			context = end;
		}

		return { error: false, context: context, end: end, endname: endname };
	},
	
	ParseJS: function(code_, is_alias_, caller_name_)
	{
		var alias_found = false;
		var alias_name = undefined;
		var alias_trailer = undefined;
		var Dotparts = [];
		var cache = undefined;


		// Remove all unwanted spaces
		var trimmed_code = code_.trim().replace(/\s*([\.\[\]])\s*/g, "$1");


		// Getting a proper cache-------------------------------------
		//if( is_alias_ )
		cache = this.AliasDotpartsCache; 
		//else
		//cache = this.NonAliasDotpartsCache;


		// Get Dotparts from cache -----------------------------------
		if( cache.Dotparts[ trimmed_code ] )
		{
			Dotparts = cache.Dotparts[ trimmed_code ];

			//if( is_alias_ )
			if( cache.IsAlias[ trimmed_code ] )
			{
				alias_found = true;
				alias_name = cache.AliasNames[ trimmed_code ];
				alias_trailer = cache.AliasTrailers[ trimmed_code ];
			}
		}
		// No cache ---------------------------------------------
		else   
		{
			//if( is_alias_ )
			{
				alias_name = trimmed_code.split(/[\.\[]/)[0];
				alias_trailer = trimmed_code.substring( alias_name.length );

				if( this.Aliases[alias_name] )
				{
					alias_found = true;

					if( alias_trailer )
					Dotparts = DotStringToDotArray( this.Aliases[alias_name].dotstring + alias_trailer.split('[').join(".[") );
					else
					Dotparts = DotStringToDotArray( this.Aliases[alias_name].dotstring );
										
				} else 
				{
					alias_name = undefined;
					alias_trailer = undefined;
					Dotparts = DotStringToDotArray( trimmed_code.split('[').join(".[") );
				}
				/*
				return { 
						error: 			true, 
						alias_found:	alias_found, 
						trimmed_code: 	trimmed_code, 
						alias_name: 	alias_name, 
						alias_trailer: 	alias_trailer 
						};
				*/
			} 
			// Not alias, just code
			/*
			else
			{
				Dotparts = DotStringToDotArray( trimmed_code.split('[').join(".[") );
			}
			*/


			// Caching ---------------------------------------------

			// delete old cache entries if max_count entries reached
			if( cache.count >= cache.max_count )
			for( var i in cache.Dotparts ) 
			{
				delete cache.Dotparts[i];

				if( cache.IsAlias[ i ] )
				{
					delete cache.AliasNames[ i ];
					delete cache.AliasTrailers[ i ];
					delete cache.IsAlias[ i ];
				}

				cache.count--;


				if(cache.count <= cache.max_count)
				break;
			}

			
			// Put things in cache
			// DANGEROUS: trimmed_code = trimmed_code + Math.random();
			
			cache.Dotparts[ trimmed_code ] = Dotparts;

			//if( is_alias_ )
			if( alias_found )		
			{
				cache.AliasNames[ trimmed_code ] = alias_name;
				cache.AliasTrailers[ trimmed_code ] = alias_trailer;
				cache.IsAlias[ trimmed_code ] = true;
			}
			

			cache.count++;
			
			//console.log( "cache.count: " + cache.count );
			//console.log( "cache.Dotparts.length: " + Object.keys(cache.Dotparts).length );
			//console.log( "cache.AliasNames.length: " + Object.keys(cache.AliasNames).length );
			//console.log( "cache.AliasTrailers.length: " + Object.keys(cache.AliasTrailers).length );
		}


		
		var Result = this.Resolve( Dotparts, caller_name_, trimmed_code, alias_name, alias_trailer );

		return { 
					error: 			Result.error, 
					end: 			Result.end, 
					endname: 		Result.endname, 
					context: 		Result.context, 
					trimmed_code: 	trimmed_code, 
					alias_found: 	alias_found, 
					alias_name: 	alias_name, 
					alias_trailer: 	alias_trailer
				};
	}
}
	for( var k in InstanceFunctionsObject )
	{
		globalThis.C3.Plugins.ValerypopoffJSPlugin.Instance.prototype[k] = InstanceFunctionsObject[k];
	}
	
}