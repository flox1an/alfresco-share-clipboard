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
        	  var clip = new Alfresco.service.Clipboard();
        	  var clipsize = clip.getAll().length;
        	  this.widgets.clipboardButton.set('disabled', clipsize == 0);
          }, this);
          
      },
      
      onCopyHere : function ClipboardMenu_onCopyHere() {
    	  this._copyOrMove({copy: true});
      },
      
      onMoveHere : function ClipboardMenu_onMoveHere() {
    	   this._copyOrMove({copy: false});
      },
      
      onClearClipboard : function ClipboardMenu_onClearClipboard() {
    	  
      },
      
      _copyOrMove : function ClipboardMenu__copyOrMove(copy) {
	
	    Alfresco.util.PopupManager.displayMessage(
        {
           text: this.msg(copy?"message.clipboard.copy":"message.clipboard.move")
        });
	    
		//get clipboard contents
		var clipboardService = new Alfresco.service.Clipboard();
		
		var nodes = clipboardService.getAll();
		var nodeRefs = [];
		for (var i = 0; i < nodes.length; i++){
			nodeRefs.push(nodes[i].nodeRef);
		}
		
		// Failure callback function
	    var fnFailure = function ASCCOM__onOK_failure(p_data)
	    {
	       Alfresco.util.PopupManager.displayMessage(
	       {
	          text: this.msg("message.failure")
	       });
	    };
	    
	    // Success callback function
	    var fnSuccess = function ASCCOM__onOK_success(p_data)
	    {
	       Alfresco.util.PopupManager.displayMessage(
	       {
	          text: this.msg("message.success")
	       });
	       
	       YAHOO.Bubbling.fire("metadataRefresh");
	    };
		
		var doclist = Alfresco.util.ComponentManager.find({name : "Alfresco.DocumentList"})[0];
		
		var folderRef = new Alfresco.util.NodeRef(doclist.doclistMetadata.parent.nodeRef);
		
		// Construct the data object for the genericAction call
	    doclist.modules.actions.genericAction(
	    {
	       success:
	       {
	          callback:
	          {
	             fn: fnSuccess,
	             scope: this
	          }
	       },
	       failure:
	       {
	          callback:
	          {
	             fn: fnFailure,
	             scope: this
	          }
	       },
	       webscript:
	       {
	          method: Alfresco.util.Ajax.POST,
	          name: (copy?"copy-to/node/{nodeRef}":"move-to/node/{nodeRef}"),
	          params:
	          {
	             nodeRef: folderRef.uri
	          }
	       },
	       wait:
	       {
	          message: this.msg("message.please-wait")
	       },
	       config:
	       {
	          requestContentType: Alfresco.util.Ajax.JSON,
	          dataObj:
	          {
	             nodeRefs: nodeRefs
	          }
	       }
	    });
	}
            
   });
   
})();
