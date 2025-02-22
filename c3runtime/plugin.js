"use strict";

if( window === undefined )
{
	var window = ("undefined" == typeof window) ? 
					("undefined" == typeof global) ? 
						("undefined" == typeof self) ? 
						this
						:self
					:global
				:window;
}

globalThis.__CONSTRUCT2_RUNTIME2__ = false;
globalThis.__CONSTRUCT3_RUNTIME2__ = false;
globalThis.__CONSTRUCT3_RUNTIME3__ = true;
globalThis.__DEBUG__ = false;

if( typeof cr == "undefined" )
{
	var cr = {};
	
	cr.do_cmp = function (x, cmp, y)
	{
		if (typeof x === "undefined" || typeof y === "undefined")
			return false;
			
		switch (cmp)
		{
			case 0:     // equal
				return x === y;
			case 1:     // not equal
				return x !== y;
			case 2:     // less
				return x < y;
			case 3:     // less/equal
				return x <= y;
			case 4:     // greater
				return x > y;
			case 5:     // greater/equal
				return x >= y;
			default:
				assert2(false, "Invalid comparison value: " + cmp);
				return false;
		}
	};
}

{
	globalThis.C3.Plugins.ValerypopoffJSPlugin = class ValerypopoffJSPluginPlugin extends globalThis.ISDKPluginBase
	{
		constructor()
		{
			super();
		}
		
		
	};
}