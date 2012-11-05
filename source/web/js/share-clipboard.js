/**
 * Alfresco Share Clipboard.
 *
 * @namespace Alfresco.service
 * @class Alfresco.service.Clipboard
 */
(function()
{
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
      /**
       * Get the complete copy of the currently cached user preferences. This value is set once per page load - a component
       * should retrieve this once onReady() but not assume the state is correct after that. The component should maintain
       * its own local copies of values as modified by set(), add() or remote() operations until the next page refresh.
       *
       * @method get
       */
      get: function Clipboard_get(nodeRef)
      {
      },
      

      /**
       * Adds a value to a user specific property that is treated as a multi value.
       * Since arrays aren't supported in the webscript we store multiple values using a comma separated string.
       *
       * @method add
       * @param name {string} The name of the property to set
       * @param value {object} The value of the property to set
       * @param responseConfig {object} A config object with only success and failure callbacks and messages
       */
      add: function Clipboard_add(name, value, responseConfig)
      {
      },
      
      getAll : function Clipboard_getAll() {
    	  
      },

      remove : function Clipboard_remove(nodeRef) {
    	  
      },

      removeAll : function Clipboard_removeAll() {
    	  
      }
   });
})();
