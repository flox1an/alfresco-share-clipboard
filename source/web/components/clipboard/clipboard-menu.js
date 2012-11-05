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
                       { text : this.msg("clipboard.action.copy.here"), onclick : { fn: this.onCopyHere, scope: this } },
                       { text : this.msg("clipboard.action.move.here"), onclick : { fn: this.onMoveHere, scope: this } },
                       { text : this.msg("clipboard.action.clear"), onclick : { fn: this.onClearClipboard, scope: this } }
/*
                       { text : "Refresh Repository Webscripts", classname: "refresh-menuitem", onclick : { fn: this.onRefreshRepoWebscripts, scope: this } },
          	      { text : "Refresh Share Webscripts", classname: "refresh-menuitem", onclick : { fn: this.onRefreshShareWebscripts, scope: this } },
          	      { text : "Refresh Share All (WS, Templates, Config)", classname: "refresh-menuitem", onclick : { fn: this.onRefreshAllShare, scope: this } },
          	      { text : "Toggle Surfbug", classname: "surfbug-menuitem", onclick : { fn: this.onSurfBug, scope: this } },
          	      { text : "Toggle Repository Debugger", classname: "debugger-menuitem", onclick : { fn: this.onRepoDebugger, scope: this } },
          	      { text : "Toggle Share Debugger", classname: "debugger-menuitem", onclick : { fn: this.onShareDebugger, scope: this } },
          	      { text : "Share Module Deployment", url : Alfresco.constants.URL_PAGECONTEXT + "modules/deploy", target:"_blank" },
          	      { text : "Javascript Console", classname: "jsconsole-menuitem", url : Alfresco.constants.URL_PAGECONTEXT + "console/admin-console/javascript-console" },
          	      { text : "Node Browser", classname: "jsconsole-menuitem", url : Alfresco.constants.URL_PAGECONTEXT + "console/admin-console/node-browser" },
          	      
          	      // TODO: get correct URL, maybe open in iframe
          	      { text : "Workflow Console", url : this.options.explorerBaseUrl + "/faces/jsp/admin/workflow-console.jsp", target:"_blank" },

          	      // TODO: check if SOLR is active, get correct URL, maybe open in iframe        	      
          	      { text : "Solr Admin Console", url : this.options.solrAdminUrl, target:"_blank" },
          	      
          	      // TODO: check if lucene is active, get correct URL, maybe open in iframe        	      
          	      { text : "Lucene Index Check", url : this.options.explorerBaseUrl + "/service/enterprise/admin/indexcheck", target:"_blank" }
          	       
          	      // TODO: Open Explorer (in IFrame)
          	      // TODO: Toggle Minification. How to change the config dynamically?
*/
          	 ]);
          
          this.widgets.clipboardButton = new YAHOO.widget.Button(
                   { id: container.id+"-clipboard",
                     type: "menu",
                      label: "Clipboard",
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
    		 this.widgets.clipboardButton.set("label", "Clipboard");
    	 }
    	 else {
    		 this.widgets.clipboardButton.set("label", "Clipboard (" + clipsize + ")");
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
