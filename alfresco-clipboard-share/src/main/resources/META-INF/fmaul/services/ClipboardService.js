define(["dojo/_base/declare",
        "alfresco/services/BaseService",
        "alfresco/core/Core",
        "dojo/_base/lang",
        "alfresco/core/CoreXhr",
        "service/constants/Default"
    ],
    function(declare, BaseService, Core, lang, AlfCoreXhr, AlfConstants) {
        return declare([BaseService, Core, AlfCoreXhr], {

            registerSubscriptions: function () {
                this.clipboardService = new Alfresco.service.Clipboard();
                this.alfSubscribe("ALF_SINGLE_DOCUMENT_ACTION_REQUEST", lang.hitch(this, this._onPayloadReceive));
                this.alfSubscribe("ALF_CLIPBOARD_GET", lang.hitch(this, this._onClipboardGet));
                this.alfSubscribe("ALF_CLIPBOARD_DELETE", lang.hitch(this, this._onClipboardDelete));
                this.alfSubscribe("ALF_CLIPBOARD_ACTION_CLEAR", lang.hitch(this, this._onClipboardActionClear));
                this.alfSubscribe("ALF_CLIPBOARD_ACTION_DOWNLOAD", lang.hitch(this, this._onClipboardActionDownload));
                this.alfSubscribe("ALF_CLIPBOARD_ACTION_SEND_EMAIL", lang.hitch(this, this._onClipboardActionSendAsEmail));

                // Clipboard initially if it is empty
                this.updateClipboardVisibilty();
            },

            _onClipboardActionSendAsEmail: function(payload) {
                console.log(payload);
                // {"nodeRefs":[{"nodeRef":"workspace://SpacesStore/1a0b110f-1e09-4ca2-b367-fe25e4964a4e"}],"subject":"Alfresco Mail Share"}
                this.serviceXhr({
                  alfTopic: "ALF_CLIPBOARD_XHR_SEND_EMAIL",
                  url: AlfConstants.PROXY_URI + 'sendMail',
                  method: "POST",
                  data: {
                    nodeRefs: this.clipboardService.getAll(),
                    subject: "Alfresco Mail Share"
                  }
                });
            },

            _onClipboardGet: function(payload) {
                this.alfPublish(payload.alfResponseTopic + "_SUCCESS", { response: { items:  this.clipboardService.getAll() } } );
            },

            _onClipboardActionClear: function(payload) {
                this.clipboardService.removeAll();
                this.alfPublish("ALF_CLIPBOARD_CHANGED");
                this.updateClipboardVisibilty();
            },

            _onClipboardActionDownload: function(payload) {
              this.alfPublish("ALF_DOWNLOAD_AS_ZIP", {documents: this.clipboardService.getAll()});
            },

            _onClipboardDelete: function(payload) {
              this.clipboardService.remove(payload.nodeRef);
              this.alfPublish("ALF_CLIPBOARD_CHANGED");
              this.updateClipboardVisibilty();
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

                  this.updateClipboardVisibilty();
                }
            },

            updateClipboardVisibilty: function() {
              var entries = this.clipboardService.getAll();
              if (entries && entries.length >= 1) {
                this.alfPublish("ALF_CLIPBOARD_SHOW", { reveal: true });
              }
              if (!entries || entries.length == 0) {
                this.alfPublish("ALF_CLIPBOARD_SHOW", { reveal: false });
              }
            }

        });
});
