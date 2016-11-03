define(["dojo/_base/declare",
        "dijit/_WidgetBase",
        "alfresco/core/Core",
        "dojo/_base/lang"
    ],
    function(declare, _Widget, Core, lang) {
        return declare([_Widget, Core], {

            postCreate: function () {

                this.alfSubscribe("ALF_SINGLE_DOCUMENT_ACTION_REQUEST", lang.hitch(this, this._onPayloadReceive));
            },

            _onPayloadReceive: function (payload) {

                if(payload.action.id == "org_alfresco_clipboard-add_document") {

                  var entry = {};
                  entry.nodeRef = payload.document.nodeRef;
                  entry.name = payload.document.displayName;
                  entry.title = entry.name;

                  var clip = new Alfresco.service.Clipboard();
                  clip.add(entry);
                }
            }

        });
});
