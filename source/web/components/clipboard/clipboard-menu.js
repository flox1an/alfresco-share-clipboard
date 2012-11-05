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
   var $html = Alfresco.util.encodeHTML;

   Alfresco.module.Clipboard = function(htmlId)
   {
      return Alfresco.module.Clipboard.superclass.constructor.call(this, "Alfresco.module.Clipboard", htmlId, ["button", "menu", "container"]);
   };

   YAHOO.extend(Alfresco.module.Clipboard, Alfresco.component.Base,
   {
      /**
       * Fired by YUI when parent element is available for scripting.
       *
       * @method onReady
       */
      onReady: function Clipboard_onReady()
      {
    	  
          var container = YAHOO.util.Selector.query(".header-bar")[0];
          var menu = ([ 
                       { text : this.msg("clipboard.action.copy.here"), classname: "clipboard-copy", onclick : { fn: this.onCopyHere, scope: this } },
                       { text : this.msg("clipboard.action.move.here"), classname: "clipboard-move", onclick : { fn: this.onMoveHere, scope: this } },
                       { text : this.msg("clipboard.action.clear"), classname: "clipboard-clear", onclick : { fn: this.onClearClipboard, scope: this } }
          	 ]);
          
          this.widgets.clipboardButton = new YAHOO.widget.Button(
                   { id: container.id+"-clipboard",
                     type: "menu",
                      label: this.msg("button.label.clipboard"),
                      menu: menu,
                      lazyloadmenu: true, 
                      container: container.id
                   });      	  
          this.widgets.clipboardButton.addClass("clipboard-menu");
          
          YAHOO.Bubbling.subscribe("clipboardChanged", function(layer, args) {
        	  this.updateButtonState();
          }, this);
          
          this.updateButtonState();
          
      },
      
      updateButtonState : function ClipboardMenu_updateButtonState() {
    	  var clip = new Alfresco.service.Clipboard();
    	  var clipsize = clip.getAll().length;
    	  this.widgets.clipboardButton.set('disabled', clipsize == 0);
    	  
    	 if (clipsize == 0) {
    		 this.widgets.clipboardButton.set("label", this.msg("button.label.clipboard"));
    	 }
    	 else {
    		 this.widgets.clipboardButton.set("label", this.msg("button.label.clipboard") + " (" + clipsize + ")");
    	 }
      },
      
      onMoveHere : function ClipboardMenu_onMoveHere() {
    	  
      },
      
      onMoveHere : function ClipboardMenu_onMoveHere() {
    	  
      },
      
      onClearClipboard : function ClipboardMenu_onClearClipboard() {
    	  var clip = new Alfresco.service.Clipboard();
    	  clip.removeAll();
      }
            
   });
   
})();
