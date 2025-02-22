"use strict";

{
var ActsObject = 
{
	ExecuteJSWithParams: function(code, params_)
    {
        var caller_name_ = "'Execute JS code' action";
        this.returnValue = undefined;
 
        // Replace all #0 #1 #3... in the code to the corresponding parameters
        code = code.replace( /#[0-9]+/g, function(str)
                                                {
                                                    var temp = params_[ str.substr(1) ];
                                                     
                                                    if (typeof temp === "string")
                                                    return "'" + temp + "'";
                                                    else
                                                    return temp;
                                                } 
                                    );
 
        try
        {
            this.returnValue = eval(code);
 
        } catch(err)
        {
            this.ShowError( 
            { 
                debug_caller: "ExecuteJSWithParams",
                caller_name: caller_name_,
                "show-code": true,
                code: code,
                error_message: err.message
            });
 
            return;
        }
    },
	ExecuteJSWithParamsNonvar: function(code, param1, param2, param3, param4, param5)
    {
        var caller_name_ = "'Execute JS code' action";
        this.returnValue = undefined;

        var params_ = [param1, param2, param3, param4, param5];
 
        // Replace all #0 #1 #3... in the code to the corresponding parameters
        code = code.replace( /#[0-9]+/g, function(str)
                                                {
                                                    var temp = params_[ str.substr(1) ];
                                                     
                                                    if (typeof temp === "string")
                                                    return "'" + temp + "'";
                                                    else
                                                    return temp;
                                                } 
                                    );
 
        try
        {
            this.returnValue = eval(code);
 
        } catch(err)
        {
            this.ShowError( 
            { 
                debug_caller: "ExecuteJSWithParams",
                caller_name: caller_name_,
                "show-code": true,
                code: code,
                error_message: err.message
            });
 
            return;
        }
    },
	CallJSfunction: function(funcname_, funcparams_, store_return_value_, caller_name_, final_)
    {
    	this.CallJSfunction(funcname_, funcparams_, store_return_value_, caller_name_, final_);
    },
	SetValue: function(alias_exp_, alias_value_)
    {
        var caller_name_ = "'Set value' action";
        var final = this.ParseJS(alias_exp_, true, caller_name_);
 
        // If such alias was not found
        /*
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "SetValue",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
            return;         
        } */
 
        // Error during parse-resolve
        if( final.error )
        return;
         
 
 
        try
        {
            final.context[final.endname] = alias_value_;
             
        // It seems like no way an error can occure though
        } catch(err)
        {
            var code = alias_exp_ + "=";
            if( typeof alias_value_ == "string" )
            code = code + "'" + alias_value_ + "'";
            else
            code = code + alias_value_;
 
            var info = 
            {
                debug_caller: "SetValue",
                caller_name: caller_name_,
                "show-alias-expression": final.alias_found,
                alias_expression: final.trimmed_code,
                "show-code": true,
                code: code,         
                error_message: err.message
            }
 
            this.ShowError( info );
            return;         
        } 
    },
	Call: function(alias_exp_, funcparams_, store_return_value_, caller_name_)
    {
		//this.CallAlias(alias_exp_, funcparams_, true, "'Call' action");

		this.CallJSfunction(alias_exp_, funcparams_, true, "'Call' action" );
    },
	CallNonvar: function(alias_exp_, param1, param2, param3, param4, param5, store_return_value_, caller_name_)
    {
		//this.CallAlias(alias_exp_, funcparams_, true, "'Call' action");

		this.CallJSfunction(alias_exp_, [param1, param2, param3, param4, param5], true, "'Call' action" );
    },
	InitAlias: function(alias_name_, alias_js_)
    {
        var caller_name_ = "'Init alias' action";
        alias_name_ = alias_name_.trim();
        alias_js_ = alias_js_.trim();
 
 
        //If the JS is empty, shoot an error
        if( alias_js_.length == 0 )
        {
            var info = 
            {
                debug_caller: "InitAlias",
                caller_name: caller_name_,
                error_message: "Javascript string of alias '" + alias_name_ + "' must not be empty."
            }
 
            this.ShowError( info );
            return;             
        }
 
        //If the alias name contains dots or brackets, shoot an error
        if( alias_name_.indexOf(".") >= 0 || alias_name_.indexOf("[") >= 0 || alias_name_.indexOf("]") >= 0 )
        {
            var info = 
            {
                debug_caller: "InitAlias",
                caller_name: caller_name_,
                error_message: "Alias name must not contain '.', '[' or ']' signs: '" + alias_name_ + "'"
            }
 
            this.ShowError( info );
            return;
        }
 
 
        // Check if there's already an alias with the same name
        //if( this.AliasIndex( alias_name_ ) >= 0 )
        if( this.Aliases[alias_name_] != undefined )
        {
            var info = 
            {
                debug_caller: "InitAlias",
                caller_name: caller_name_,
                error_message: "Alias '" + alias_name_ + "' already exists"
            }
 
            this.ShowError( info );
            return;
        }
 
 
        // Finally, if everything is OK, add new alias
        var newAlias = new Object();
        newAlias.js = alias_js_;
        newAlias.dotstring = alias_js_.split('[').join(".[");
        //newAlias.name = alias_name_;
        //newAlias.dotparts = DotStringToDotArray(newAlias.dotstring);
        //newAlias.dotparts_length = newAlias.dotparts.length;
 
        this.Aliases[alias_name_] = newAlias;
    },
	SetAlias: function(alias_exp_, alias_value_)
    {
        var caller_name_ = "'Set alias' action";
        var final = this.ParseJS(alias_exp_, true, "'Set alias' action");
 
        // If such alias was not found
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "SetAlias",
                caller_name: caller_name_,              
                error_message: "No such alias '" + final.trimmed_code + "'"
            }
 
            this.ShowError( info );
            return;         
        }
 
        // Error during parse-resolve
        if( final.error )
        return;
         
 
 
        try
        {
            final.context[final.endname] = alias_value_;
             
        // It seems like no way an error can occure though
        } catch(err)
        {
            var code = alias_exp_ + "=";
            if( typeof alias_value_ == "string" )
            code = code + "'" + alias_value_ + "'";
            else
            code = code + alias_value_;
 
            var info = 
            {
                debug_caller: "SetAlias",
                caller_name: caller_name_,
                "show-alias-expression": true,
                alias_expression: final.trimmed_code,
                "show-code": true,
                code: code,         
                error_message: err.message
            }
 
            this.ShowError( info );
            return;         
        } 
    },
	CallAlias: function(alias_exp_, funcparams_, store_return_value_, caller_name_)
    {
		this.CallAlias(alias_exp_, funcparams_, store_return_value_, caller_name_);
    }
};

	globalThis.C3.Plugins.ValerypopoffJSPlugin.Acts = {};

	for( var k in ActsObject )
	{
		globalThis.C3.Plugins.ValerypopoffJSPlugin.Acts[k] = ActsObject[k];
	}
}

globalThis.C3.Plugins.ValerypopoffJSPlugin.Instance.prototype.ACTS = globalThis.C3.Plugins.ValerypopoffJSPlugin.Acts;
