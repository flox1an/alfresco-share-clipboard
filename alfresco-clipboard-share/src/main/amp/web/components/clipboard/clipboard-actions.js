(function() {
    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionClipboardAddDocument",
        fn: function ASC_onActionClipboardAddDocument(file) {
        	      	
        	var entry = {};
        	entry.nodeRef = file.nodeRef;
        	entry.name = file.displayName;
        	entry.title = entry.name;
        	
        	var clip = new Alfresco.service.Clipboard();
        	clip.add(entry);
        
        }
    });
    

    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionClipboardAddDocuments",
        fn: function ASC_onActionClipboardAddDocuments(files) {
        	if (files.length != undefined) {
			    for ( var i = 0; i < files.length; i++) {
        	      	
		        	var entry = {};
		        	entry.nodeRef = files[i].nodeRef;
		        	entry.name = files[i].displayName;
		        	entry.title = entry.name;
		        	
		        	var clip = new Alfresco.service.Clipboard();
		        	clip.add(entry);
		        }
		    }
        
        }
    });

    
    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionClipboardCopyHere",
        fn: function ASC_onActionClipboardCopyHere(folder) {
        	Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.clipboard.copy")
            });
        	runClipboardAction(this, folder, "copy-to");
        	    	        	
        }
    });
    
    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionClipboardMoveHere",
        fn: function ASC_onActionClipboardMoveHere(folder) {
        	Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.clipboard.move")
            });
        	runClipboardAction(this, folder, "move-to");
        	    	        	
        }
    });
    
    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionClipboardLinkHere",
        fn: function ASC_onActionClipboardLinkHere(folder) {
        	Alfresco.util.PopupManager.displayMessage(
            {
               text: this.msg("message.clipboard.link")
            });
        	runClipboardAction(this, folder, "link-to");
        }
    });
    
    runClipboardAction: function runClipboardAction(scope, folder, mode){
    	//get clipboard contents
    	var clipboardService = new Alfresco.service.Clipboard();
    	
    	var nodes = clipboardService.getAll();
    	var nodeRefs = [];

    	for (var i = 0; i < nodes.length; i++){
    		nodeRefs.push(nodes[i].nodeRef);
    	}
    	
    	// Failure callback function
        var fnFailure = function DLCCH__onOK_failure(p_data)
        {
           Alfresco.util.PopupManager.displayMessage(
           {
              text: scope.msg("message.failure")
           });
        };
        
        // Success callback function
        var fnSuccess = function DLCCH__onOK_success(p_data)
        {
           Alfresco.util.PopupManager.displayMessage(
           {
              text: scope.msg("message.success")
           });
        };
    	
        var folderRef = new Alfresco.util.NodeRef(folder.nodeRef);
		// Construct the data object for the genericAction call
        scope.modules.actions.genericAction(
        {
           success:
           {
              callback:
              {
                 fn: fnSuccess,
                 scope: scope
              }
           },
           failure:
           {
              callback:
              {
                 fn: fnFailure,
                 scope: scope
              }
           },
           webscript:
           {
              method: Alfresco.util.Ajax.POST,
              name: mode + "/node/{nodeRef}",
              params:
              {
                 nodeRef: folderRef.uri
              }
           },
           wait:
           {
              message: scope.msg("message.please-wait")
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
})();