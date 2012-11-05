/**
 * Alfresco Share Clipboard.
 *
 * @namespace Alfresco.service
 * @class Alfresco.service.Clipboard
 */
(function()
{
	var SHARE_CLIPBOARD_KEY = "Share.Clipboard";
	
	var getClipboardData = function Clipboard_getClipboardData() {
	  	  var storedData = localStorage.getItem(SHARE_CLIPBOARD_KEY), data = {};
		  if (storedData) {
	    	  var data = JSON.parse(storedData);
	    	  
	    	  if (data !== undefined) {
	    		  return data;
	    	  }
		  }
		  return {};
	} 

	var storeClipboardData = function Clipboard_storeClipboardData(data) {
		if (data !== undefined) {
			localStorage.setItem(SHARE_CLIPBOARD_KEY, JSON.stringify(data));
		}
	} 
	
   /**
    * Clipboard constructor.
    *
    * @return {Alfresco.service.Clipboard} The new Alfresco.service.Clipboard instance
    * @constructor
    */
   Alfresco.service.Clipboard = function Clipboard_constructor()
   {
      Alfresco.service.Clipboard.superclass.constructor.call(this);
      return this;
   };

   YAHOO.extend(Alfresco.service.Clipboard, Alfresco.service.BaseService,
   {
      get: function Clipboard_get(nodeRef)
      {
    	  var data = getClipboardData();
    	  return data[nodeRef];
      },

      add: function Clipboard_add(entry)
      {
    	  var data = getClipboardData();
    	  if (entry.nodeRef) {
        	  data[entry.nodeRef] = entry;
        	  storeClipboardData(data);
    	  }
    	  else {
    		  throw "Entry does not have a nodeRef property!";
    	  }
      },
      
      getAll : function Clipboard_getAll() {
    	  var data = getClipboardData();
    	  var list = [];
    	  for(var key in data) {
    		  list.push(data[key]);
    	  }
    	  return list;
      },

      remove : function Clipboard_remove(nodeRef) {
    	  var data = getClipboardData();
    	  delete data[nodeRef];
    	  storeClipboardData(data);
      },

      removeAll : function Clipboard_removeAll() {
    	  storeClipboardData({});
      }
   });
})();
