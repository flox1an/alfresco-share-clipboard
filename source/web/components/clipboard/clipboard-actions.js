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
    	        actionName: "onActionClipboardCopyHere",
    	        fn: function ASC_onActionClipboardCopyHere(folder) {
    	        	Alfresco.util.PopupManager.displayMessage(
    	            {
    	               text: this.msg("message.clipboard.copy")
    	            });
    	        	//get clipboard contents
    	        	var clipboardService = new Alfresco.service.Clipboard();
    	        	
    	        	var nodes = clipboardService.getAll();
    	        	var nodeRefs = [];
    	        	//var nodeRefs = ["workspace://SpacesStore/a087c6f4-f627-40a3-b5d8-41aa3ad93a9b", "workspace://SpacesStore/6561c135-c689-443e-ac02-bddbc011ef9e"];
    	        	for (var i = 0; i < nodes.length; i++){
    	        		nodeRefs.push(nodes[i].nodeRef);
    	        	}
    	        	
    	        	// Failure callback function
    	            var fnFailure = function DLCCH__onOK_failure(p_data)
    	            {
    	               Alfresco.util.PopupManager.displayMessage(
    	               {
    	                  text: this.msg("message.failure")
    	               });
    	            };
    	            
    	            // Success callback function
    	            var fnSuccess = function DLCCH__onOK_success(p_data)
    	            {
    	               Alfresco.util.PopupManager.displayMessage(
    	               {
    	                  text: this.msg("message.success")
    	               });
    	            };
    	        	
    	            var folderRef = new Alfresco.util.NodeRef(folder.nodeRef);
    	    		// Construct the data object for the genericAction call
    	            this.modules.actions.genericAction(
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
    	                  name: "copy-to/node/{nodeRef}",
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
    
    //TODO: clean up duplicate code!
    YAHOO.Bubbling.fire("registerAction",
    	    {
    	        actionName: "onActionClipboardLinkHere",
    	        fn: function ASC_onActionClipboardLinkHere(folder) {
    	        	Alfresco.util.PopupManager.displayMessage(
    	            {
    	               text: this.msg("message.clipboard.link")
    	            });
    	        	//get clipboard contents
    	        	var clipboardService = new Alfresco.service.Clipboard();
    	        	
    	        	var nodes = clipboardService.getAll();
    	        	var nodeRefs = [];
    	        	//var nodeRefs = ["workspace://SpacesStore/a087c6f4-f627-40a3-b5d8-41aa3ad93a9b", "workspace://SpacesStore/6561c135-c689-443e-ac02-bddbc011ef9e"];
    	        	for (var i = 0; i < nodes.length; i++){
    	        		nodeRefs.push(nodes[i].nodeRef);
    	        	}
    	        	
    	        	// Failure callback function
    	            var fnFailure = function DLCCH__onOK_failure(p_data)
    	            {
    	               Alfresco.util.PopupManager.displayMessage(
    	               {
    	                  text: this.msg("message.failure")
    	               });
    	            };
    	            
    	            // Success callback function
    	            var fnSuccess = function DLCCH__onOK_success(p_data)
    	            {
    	               Alfresco.util.PopupManager.displayMessage(
    	               {
    	                  text: this.msg("message.success")
    	               });
    	            };
    	        	
    	            var folderRef = new Alfresco.util.NodeRef(folder.nodeRef);
    	    		// Construct the data object for the genericAction call
    	            this.modules.actions.genericAction(
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
    	                  name: "link-to/node/{nodeRef}",
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