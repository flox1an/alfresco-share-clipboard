define(["dojo/_base/declare",
        "alfresco/services/BaseService",
        "alfresco/core/Core",
        "dojo/_base/lang"
    ],
    function(declare, BaseService, Core, lang) {
        return declare([BaseService, Core], {

            registerSubscriptions: function () {
                this.clipboardService = new Alfresco.service.Clipboard();
                this.alfSubscribe("ALF_SINGLE_DOCUMENT_ACTION_REQUEST", lang.hitch(this, this._onPayloadReceive));
                this.alfSubscribe("ALF_CLIPBOARD_GET", lang.hitch(this, this._onClipboardGet));
                this.alfSubscribe("ALF_CLIPBOARD_DELETE", lang.hitch(this, this._onClipboardDelete));
                this.alfSubscribe("ALF_CLIPBOARD_ACTION_CLEAR", lang.hitch(this, this._onClipboardActionClear));
                this.alfSubscribe("ALF_CLIPBOARD_ACTION_DOWNLOAD", lang.hitch(this, this._onClipboardActionDownload));
            },

            _onClipboardGet: function(payload) {
                this.alfPublish(payload.alfResponseTopic + "_SUCCESS", { response: { items:  this.clipboardService.getAll() } } );
            },

            _onClipboardActionClear: function(payload) {
                this.clipboardService.removeAll();
                this.alfPublish("ALF_CLIPBOARD_SHOW", { reveal: false });
                this.alfPublish("ALF_CLIPBOARD_CHANGED");
            },

            _onClipboardActionDownload: function(payload) {
              this.alfPublish("ALF_DOWNLOAD_AS_ZIP", {documents: this.clipboardService.getAll()});
            },

            _onClipboardDelete: function(payload) {
              this.clipboardService.remove(payload.nodeRef);
              this.alfPublish("ALF_CLIPBOARD_CHANGED");

              var entries = this.clipboardService.getAll();
              if (entries && entries.length == 0) {
                this.alfPublish("ALF_CLIPBOARD_SHOW", { reveal: false });
              }
            },

            _onPayloadReceive: function (payload) {

                if(payload.action.id == "org_alfresco_clipboard-add_document") {

                  var entry = {
                    nodeRef : payload.document.nodeRef,
                    name : payload.document.displayName,
                    title : payload.document.displayName
                  };

                  this.clipboardService.add(entry);
                  this.alfPublish("ALF_CLIPBOARD_CHANGED");

                  var entries = this.clipboardService.getAll();
                  if (entries && entries.length == 1) {
                    this.alfPublish("ALF_CLIPBOARD_SHOW", { reveal: true });
                  }

                }
            }

        });
});
