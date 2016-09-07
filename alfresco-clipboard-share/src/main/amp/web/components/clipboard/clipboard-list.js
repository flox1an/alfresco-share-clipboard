/**
 * DocumentList TreeView component.
 * 
 * @namespace Alfresco
 * @class Alfresco.DocListTree
 */
(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * Alfresco Slingshot aliases
    */
    var $combine = Alfresco.util.combinePaths;

   /**
    * DocumentList Clipboard constructor.
    * 
    * @param {String} htmlId The HTML id of the parent element
    * @return {DocListClipboard} The new DocListClipboard instance
    * @constructor
    */
   Alfresco.DocListClipboard = function DLT_constructor(htmlId)
   {
      Alfresco.DocListClipboard.superclass.constructor.call(this, "Alfresco.DocListClipboard", htmlId);
      
      // Re-register with our own name
      this.name = "Alfresco.DocListClipboard";
      Alfresco.util.ComponentManager.reregister(this);
      
      // Decoupled event listeners
      YAHOO.Bubbling.on("clipboardChanged", this.onClipboardChanged, this);
      var me = this;
      // Hook like/unlike events
      var fnClipboardHandler = function DL_fnClipboardHandler(layer, args)
      {
         var nodeRef = args[1].el.getAttribute("data-noderef")
         me.onClipboardRemove.call(me, nodeRef);
         
         return true;
      };
      YAHOO.Bubbling.addDefaultAction("remove-clipboard-action", fnClipboardHandler);

      return this;
   };
   
   YAHOO.extend(Alfresco.DocListClipboard, Alfresco.component.Base,
   {
      /**
       * Object container for initialization options
       */
      options:
      {
         
      },
      

      /**
       * Fired by YUI when parent element is available for scripting
       * @method onReady
       */
      onReady: function DLC_onReady()
      {
         // Reference to self - used in inline functions
         var me = this;
         this.clipboardService = new Alfresco.service.Clipboard();
         
         // Create twister from our H2 tag
         Alfresco.util.createTwister(this.id + "-h2", this.name.substring(this.name.lastIndexOf(".") + 1));
         
         this.listElement = Dom.get(this.id +"-clipboard");
         this.updateClipboardList();
        
      },
      
      onClipboardRemove: function DL_onClipboardRemove(nodeRef){
    	  this.clipboardService.remove(nodeRef);
      },
      
      updateClipboardList : function DLC_updateClipboardList(){
    	//get clipboard contents
       	
       	var nodes = this.clipboardService.getAll();
       	
       	var html ="";
      	for (var i = 0; i < nodes.length; i++){
      		html += "<li><span>"+ nodes[i].name + "</span><a class='remove-clipboard-action' data-nodeRef='"+nodes[i].nodeRef +"'></a></li>";
      	}
      	this.listElement.innerHTML = html;  
      },
      
      onClipboardChanged : function DLC_onClipboardChanged(layer, args){
    	  this.updateClipboardList();
      }
   });
})();
