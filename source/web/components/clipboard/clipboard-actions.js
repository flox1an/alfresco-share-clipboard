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
    
})();