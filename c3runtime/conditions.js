"use strict";

{
	var CndsObject =
	{
	C2CompareFunctionReturnValue: function(value_, cmp_, funcname_, funcparams_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        return this.CNDS.CompareFunctionReturnValue.call( this, funcname_, funcparams_, cmp_, value_ );
    },
	C2CompareAliasCallReturnValue: function(value_, cmp_, alias_exp_, funcparams_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        return this.CNDS.CompareAliasCallReturnValue.call( this, alias_exp_, funcparams_, cmp_, value_ );
    },
	C2CompareExecReturnWithParams: function(value_, cmp_, code_, params_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        return this.CNDS.CompareExecReturnWithParams.call( this, code_, params_, cmp_, value_ );
    },
	C2CompareValue: function(value_, cmp_, alias_exp_, funcparams_)
    {   
        switch( cmp_ )
        {
            case 2: cmp_=4; break;
            case 3: cmp_=5; break;
            case 4: cmp_=2; break;
            case 5: cmp_=3; break;
        }
 
        //return this.CNDS.CompareAliasCallReturnValue.call( this, alias_exp_, funcparams_, cmp_, value_ );
        return this.CNDS.CompareValue.call(this, alias_exp_, funcparams_, cmp_, value_)
    },
	CompareExecReturnWithParams: function(code_, params_, cmp_, value_)
    {   
        var ret = undefined;
        var caller_name_ = "'Compare JS code Completion value' condition";

        if( params_.length )
        code_ = HashtagParamsToCode(code_, params_);


        try
        {
            ret = eval(code_);

        } catch(err)
        {
            var info = 
            {
                debug_caller: "CompareExecReturnWithParams",
                caller_name: caller_name_,              
                error_message: err.message,
                "show-code": true,
                code: code_
            }

            this.ShowError( info );
            return;
        }


        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);
    },
	CompareExecReturnWithParamsNonvar: function(code_, param1, param2, param3, param4, param5, cmp_, value_)
    {   
        var ret = undefined;
        var caller_name_ = "'Compare JS code Completion value' condition";
        var params_ = [param1, param2, param3, param4, param5]

        if( params_.length )
        code_ = HashtagParamsToCode(code_, params_);


        try
        {
            ret = eval(code_);

        } catch(err)
        {
            var info = 
            {
                debug_caller: "CompareExecReturnWithParams",
                caller_name: caller_name_,              
                error_message: err.message,
                "show-code": true,
                code: code_
            }

            this.ShowError( info );
            return;
        }


        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);
    },
	CompareFunctionReturnValue: function(funcname_, funcparams_, cmp_, value_)
    {   
        var store_return_value_ = false;
        var ret = undefined;

        //Calling the CallJSfunction action with the flag "false" so it doesn't not store return value. 
        //We only want to store return value when the user explicitly calls Plugin Actions that execute JS code
        ret = this.CallJSfunction(funcname_, funcparams_, store_return_value_, "'Compare Function return value' condition" );

        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);

        //Double(12) > 24
    },
	CompareStoredReturnValue: function(cmp_, value_)
    {   
        var ret = this.returnValue;
 
        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);
    },
	AllScriptsLoaded: function()
    {   
        return ( this.sciptsToLoad <= 0 ) ? true : false;
    },
	CompareValue: function(alias_exp_, funcparams_, cmp_, value_)
    {   
        //var store_return_value_ = false;
        var ret = undefined;

        //Calling the CallAlias action with the flag "false" so it doesn't not store return value. 
        //We only want to store return value when the user explicitly calls Plugin Actions that execute JS code

		var caller_name = "'Compare Value' condition";

    	ret = this.Value( caller_name, [].concat(alias_exp_, funcparams_) );

        //ret = this.CallJSfunction(alias_exp_, funcparams_, false, "'Compare Value' condition" );

        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);

        //Double(12) > 24
    },
	CompareValueNonvar: function(alias_exp_, param1, param2, param3, param4, param5, cmp_, value_)
    {   
        //var store_return_value_ = false;
        var ret = undefined;

        //Calling the CallAlias action with the flag "false" so it doesn't not store return value. 
        //We only want to store return value when the user explicitly calls Plugin Actions that execute JS code

		var caller_name = "'Compare Value' condition";

    	ret = this.Value( caller_name, [].concat(alias_exp_, [param1, param2, param3, param4, param5]) );

        //ret = this.CallJSfunction(alias_exp_, funcparams_, false, "'Compare Value' condition" );

        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);

        //Double(12) > 24
    },
	CompareAliasValue: function(alias_exp_, cmp_, value_)
    {   
        var caller_name_ = "'Compare alias' condition";
        var store_return_value_ = false;
        var final = this.ParseJS(alias_exp_, true, "'Set alias' action");
 
        // If such alias was not found
        if( !final.alias_found )
        {
            var info = 
            {
                debug_caller: "CompareAliasValue",
                caller_name: caller_name_,              
                error_message: "No such alias '" + alias_exp_ + "'"
            }
 
            this.ShowError( info );
            return;
        }
 
        // If there was an error during parse-resolve
        if( final.error )
        {
            return;
        }
 
 
 
        // If there's an object and there's a special ConstructCompare function declared in the object
        var custom_method = final.context[ this.construct_compare_function_prefix + final.endname ];
        if( custom_method && typeof(final.context) == "object" )
        {
            try
            {
                return custom_method.call( final.context, cmp_, value_ );
 
            } catch(err)
            {
                var info = 
                {
                    debug_caller: "CompareAliasValue",
                    caller_name: caller_name_,
                    "show-alias-expression": true,
                    alias_expression: final.trimmed_code,           
                    error_message: "Error in user defined '" + this.construct_compare_function_prefix + final.endname + "' function: " + err.message
                }
 
                this.ShowError( info );
                return; 
            }
             
        } else
        // Otherwise do standard Construct comparison
        {
            var ret = final.end;
             
            if( typeof ret === "boolean" )
            ret = ret ? 1 : 0;
 
            return cr.do_cmp(ret, cmp_, value_);
        }
    },
	CompareAliasCallReturnValue: function(alias_exp_, funcparams_, cmp_, value_)
    {   
        var store_return_value_ = false;
        var ret = undefined;

        //Calling the CallAlias action with the flag "false" so it doesn't not store return value. 
        //We only want to store return value when the user explicitly calls Plugin Actions that execute JS code
        ret = this.CallAlias(alias_exp_, funcparams_, store_return_value_, "'Compare Alias Call return value' condition" );

        if( typeof ret === "boolean" )
        ret = ret ? 1 : 0;
             
        return cr.do_cmp(ret, cmp_, value_);

        //Double(12) > 24
    }
	};	

	globalThis.C3.Plugins.ValerypopoffJSPlugin.Cnds = {};

	for( var k in CndsObject )
	{
		globalThis.C3.Plugins.ValerypopoffJSPlugin.Cnds[k] = CndsObject[k];
	}
}

globalThis.C3.Plugins.ValerypopoffJSPlugin.Instance.prototype.CNDS = globalThis.C3.Plugins.ValerypopoffJSPlugin.Cnds;
