var searchResultPage = widgetUtils.findObject(model.jsonModel.widgets, "id", "FCTSRCH_SEARCH_RESULT");

if(searchResultPage != null) {
    searchResultPage.config = {
        enableContextMenu : false,
        mergeActions : true,
        additionalDocumentAndFolderActions : ["org_alfresco_clipboard-add_document"]
    }
}

model.jsonModel.widgets.push({
    id: "CLIPBOARD_ACTION_LISTENER",
    name: "fmaul/action/ClipboardListener"
});
