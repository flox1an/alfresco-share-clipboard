(function() {
    YAHOO.Bubbling.fire("registerAction",
    {
        actionName: "onActionClipboardAddDocument",
        fn: function ASC_onActionClipboardAddDocument(file) {
        	alert("Hi!");
        	console.log(file);
        }
    });
})();