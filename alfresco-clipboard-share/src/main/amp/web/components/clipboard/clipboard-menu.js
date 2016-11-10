(function() {
    /**
     * YUI Library aliases
     */
    var Dom = YAHOO.util.Dom,
        Event = YAHOO.util.Event;

    /**
     * Alfresco Slingshot aliases
     */
    var $html = Alfresco.util.encodeHTML;

    Alfresco.module.Clipboard = function(htmlId) {
        return Alfresco.module.Clipboard.superclass.constructor.call(this, "Alfresco.module.Clipboard", htmlId, ["button", "menu", "container"]);
    };

    YAHOO.extend(Alfresco.module.Clipboard, Alfresco.component.Base, {
        /**
         * Fired by YUI when parent element is available for scripting.
         *
         * @method onReady
         */
        onReady: function Clipboard_onReady() {

            var container = YAHOO.util.Selector.query(".header-bar")[0];
            var menu = ([{
                text: this.msg("clipboard.action.copy.here"),
                classname: "clipboard-copy",
                onclick: {
                    fn: this.onCopyHere,
                    scope: this
                }
            }, {
                text: this.msg("clipboard.action.link.here"),
                classname: "clipboard-link",
                onclick: {
                    fn: this.onLinkHere,
                    scope: this
                }
            }, {
                text: this.msg("clipboard.action.move.here"),
                classname: "clipboard-move",
                onclick: {
                    fn: this.onMoveHere,
                    scope: this
                }
            }, {
                text: this.msg("clipboard.action.download"),
                classname: "clipboard-download",
                onclick: {
                    fn: this.onDownloadClipboard,
                    scope: this
                }
            }, {
                text: this.msg("clipboard.action.send.attachment"),
                classname: "clipboard-send-attachment",
                onclick: {
                    fn: this.onSendAttachment,
                    scope: this
                }
            }, {
                text: this.msg("action.clipboard.clear"),
                classname: "clipboard-clear",
                onclick: {
                    fn: this.onClearClipboard,
                    scope: this
                }
            }]);

            this.widgets.clipboardButton = new YAHOO.widget.Button({
                id: container.id + "-clipboard",
                type: "menu",
                label: this.msg("button.label.clipboard"),
                menu: menu,
                lazyloadmenu: true,
                container: container.id
            });
            this.widgets.clipboardButton.addClass("clipboard-menu");

            YAHOO.Bubbling.subscribe("clipboardChanged", function(layer, args) {
                this.updateButtonState();
            }, this);

            this.updateButtonState();

        },

        updateButtonState: function ClipboardMenu_updateButtonState() {
            var clip = new Alfresco.service.Clipboard();
            var clipsize = clip.getAll().length;
            this.widgets.clipboardButton.set('disabled', clipsize == 0);

            if (clipsize == 0) {
                this.widgets.clipboardButton.set("label", this.msg("button.label.clipboard"));
            } else {
                this.widgets.clipboardButton.set("label", this.msg("button.label.clipboard") + " (" + clipsize + ")");
            }
        },

        onCopyHere: function ClipboardMenu_onCopyHere() {
            this._copyOrMove({
                mode: "copy"
            });
        },

        onLinkHere: function ClipboardMenu_onLinkHere() {
            this._copyOrMove({
                mode: "link"
            });
        },

        onMoveHere: function ClipboardMenu_onMoveHere() {
            this._copyOrMove({
                mode: "move"
            });
        },

        onDownloadClipboard: function ClipboardMenu_onDownloadClipboard() {
            var downloadDialog = Alfresco.getArchiveAndDownloadInstance(),
                config = {
                    nodesToArchive: []
                };
            var clipboardService = new Alfresco.service.Clipboard();

            var nodes = clipboardService.getAll();
            for (var i = 0; i < nodes.length; i++) {
                config.nodesToArchive.push({
                    "nodeRef": nodes[i].nodeRef
                })
            }

            downloadDialog.show(config);
        },

        onClearClipboard: function ClipboardMenu_onClearClipboard() {
            var clip = new Alfresco.service.Clipboard();
            clip.removeAll();
        },

        onSendAttachment: function ClipboardMenu_onSendAttachment() {
            var clipboardService = new Alfresco.service.Clipboard();
            var nodeRefs = [];
            var nodes = clipboardService.getAll();
            for (var i = 0; i < nodes.length; i++) {
                nodeRefs.push({
                    "nodeRef": nodes[i].nodeRef
                });
            }
            // Failure callback function
            var fnFailure = function _onSendAttachment_onOK_failure(p_data) {
                if (p_data.json.message) {
                    Alfresco.util.PopupManager.displayMessage({
                        text: this.msg("message.failure" + "." + p_data.json.message)
                    });
                } else {
                    Alfresco.util.PopupManager.displayMessage({
                        text: this.msg("message.failure")
                    });
                }
            };

            // Success callback function
            var fnSuccess = function _onSendAttachment_onOK_success(p_data) {
                Alfresco.util.PopupManager.displayMessage({
                    text: this.msg("message.success")
                });

                YAHOO.Bubbling.fire("metadataRefresh");
            };

            var doclist = Alfresco.util.ComponentManager.find({
                name: "Alfresco.DocumentList"
            })[0];

            var folderRef = new Alfresco.util.NodeRef(doclist.doclistMetadata.parent.nodeRef);

            // Construct the data object for the genericAction call
            doclist.modules.actions.genericAction({
                success: {
                    callback: {
                        fn: fnSuccess,
                        scope: this
                    }
                },
                failure: {
                    callback: {
                        fn: fnFailure,
                        scope: this
                    }
                },
                webscript: {
                    method: Alfresco.util.Ajax.POST,
                    name: "sendMail",
                    stem: Alfresco.constants.PROXY_URI
                },
                wait: {
                    message: this.msg("message.please-wait")
                },
                config: {
                    requestContentType: Alfresco.util.Ajax.JSON,
                    dataObj: {
                        nodeRefs: nodeRefs,
                        subject: this.msg("message.mail.subject")
                    }
                }
            });

        },

        _copyOrMove: function ClipboardMenu__copyOrMove(action) {

            var mode = action.mode;

            Alfresco.util.PopupManager.displayMessage({
                text: this.msg("message.clipboard." + mode)
            });

            //get clipboard contents
            var clipboardService = new Alfresco.service.Clipboard();

            var nodes = clipboardService.getAll();
            var nodeRefs = [];
            for (var i = 0; i < nodes.length; i++) {
                nodeRefs.push(nodes[i].nodeRef);
            }

            // Failure callback function
            var fnFailure = function _copyOrMove__onOK_failure(p_data) {
                Alfresco.util.PopupManager.displayMessage({
                    text: this.msg("message.failure")
                });
            };

            // Success callback function
            var fnSuccess = function _copyOrMove__onOK_success(p_data) {
                Alfresco.util.PopupManager.displayMessage({
                    text: this.msg("message.success")
                });

                YAHOO.Bubbling.fire("metadataRefresh");
            };

            var doclist = Alfresco.util.ComponentManager.find({
                name: "Alfresco.DocumentList"
            })[0];

            var folderRef = new Alfresco.util.NodeRef(doclist.doclistMetadata.parent.nodeRef);

            // Construct the data object for the genericAction call
            doclist.modules.actions.genericAction({
                success: {
                    callback: {
                        fn: fnSuccess,
                        scope: this
                    }
                },
                failure: {
                    callback: {
                        fn: fnFailure,
                        scope: this
                    }
                },
                webscript: {
                    method: Alfresco.util.Ajax.POST,
                    name: mode + "-to/node/{nodeRef}",
                    params: {
                        nodeRef: folderRef.uri
                    }
                },
                wait: {
                    message: this.msg("message.please-wait")
                },
                config: {
                    requestContentType: Alfresco.util.Ajax.JSON,
                    dataObj: {
                        nodeRefs: nodeRefs,
                        subject: this.msg("message.subject")
                    }
                }
            });
        }

    });

})();
