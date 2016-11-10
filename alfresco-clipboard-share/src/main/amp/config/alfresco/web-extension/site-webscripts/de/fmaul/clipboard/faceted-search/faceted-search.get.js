var searchResultPage = widgetUtils.findObject(model.jsonModel.widgets, "id", "FCTSRCH_SEARCH_RESULT");

if (searchResultPage != null) {
    searchResultPage.config = {
        enableContextMenu: false,
        mergeActions: true,
        additionalDocumentAndFolderActions: ["org_alfresco_clipboard-add_document"]
    }
}

model.jsonModel.services.push("fmaul/services/ClipboardService");

var pageVertical = widgetUtils.findObject(model.jsonModel.widgets, "id", "FCTSRCH_MAIN_VERTICAL_STACK");

var topMenu = widgetUtils.findObject(model.jsonModel.widgets, "id", "FCTSRCH_TOP_MENU_BAR");
var searchForm = widgetUtils.findObject(model.jsonModel.widgets, "id", "FCTSRCH_SEARCH_FORM");
widgetUtils.deleteObjectFromArray(model.jsonModel.widgets, "id", "FCTSRCH_TOP_MENU_BAR");
widgetUtils.deleteObjectFromArray(model.jsonModel.widgets, "id", "FCTSRCH_SEARCH_FORM");


var propertyCell = {
    name: "alfresco/lists/views/layouts/Cell",
    config: {
        widgets: [{
            name: "alfresco/renderers/Property",
            config: {
                propertyToRender: "name"
            }
        }]
    }
};

var deleteActionCell = {
    name: "alfresco/lists/views/layouts/Cell",
    config: {
        widgets: [{
            name: "alfresco/renderers/PublishAction",
            config: {
                publishPayloadType: "CURRENT_ITEM",
                iconClass: "delete-16",
                propertyToRender: "title",
                altText: "Delete {0}",
                publishTopic: "ALF_CLIPBOARD_DELETE"
            }
        }]
    }
};

var clipboardMenu = {

    id: "ALF_CLIPBOARD_POPUP_MENU",
    name: "alfresco/menus/AlfMenuBarPopup",
    config: {
        label: msg.get("header.clipboard"),
        widgets: [{
            name: "alfresco/menus/AlfMenuItem",
            config: {
                label: msg.get("actions.folder.download"),
                iconClass: "alf-download-as-zip-icon",
                publishTopic: "ALF_CLIPBOARD_ACTION_DOWNLOAD"

            }
        }, {
            name: "alfresco/menus/AlfMenuItem",
            config: {
                label: msg.get("action.clipboard.clear"),
                iconClass: "alf-delete-icon",
                publishTopic: "ALF_CLIPBOARD_ACTION_CLEAR"
            }
        }]
    }

};

var searchMenuBar = widgetUtils.findObject(model.jsonModel.widgets, "id", "FCTSRCH_SEARCH_LIST_MENU_BAR");

if (searchMenuBar != null) {
    searchMenuBar.config.widgets.unshift(clipboardMenu);
}


if (pageVertical != undefined) {
    pageVertical.config.widgets.splice(2, 0, {
        "id": "FCTSRCH_TOP_MENU_HORIZONTAL",
        "name": "alfresco\/layout\/HorizontalWidgets",
        "config": {
            "widgets": [{
                "id": "FCTSRCH_TOP_MENU_VERTICAL",
                "name": "alfresco\/layout\/VerticalWidgets",
                "config": {
                    "widgets": [topMenu, searchForm]
                }
            }, {
                name: "alfresco\/lists\/AlfList",
                config: {
                    loadDataPublishTopic: "ALF_CLIPBOARD_GET",
                    reloadDataTopic: "ALF_CLIPBOARD_CHANGED",
                    widgets: [{
                        name: "alfresco/lists/views/AlfListView",
                        config: {
                            widgets: [{
                                name: "alfresco/lists/views/layouts/Row",
                                config: {
                                    widgets: [propertyCell, deleteActionCell]
                                }
                            }]
                        }
                    }],
                    visibilityConfig: {
                        initialValue: true,
                        rules: [{
                            topic: "ALF_CLIPBOARD_SHOW",
                            attribute: "reveal",
                            is: [true],
                            strict: true
                        }]
                    }
                }
            }]
        }
    });

}
