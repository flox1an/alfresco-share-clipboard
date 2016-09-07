# Alfresco Share Clipboard

This project defines a Share Clipboard that allows collecting documents in Alfresco
Share.

## Building

To build the individual AMP files, run the following command from the projects directory.
* Project alfresco-clipboard-repo: `mvn clean package`
* Project alfresco-clipboard-share: `mvn clean package`

### Local development system

* Execute run script of alfresco-clipboard-repo. Alfresco repository will be startet and is accessible at `http://localhost:8080/alfresco`
* Execute run script of alfresco-clipboard-share. Alfresco share will be startet and is accessible at `http://localhost:8081/share`

To enable the Clipboard go to the Share Module Management Compontent and enable the Share Clipboard: `http://localhost:8081/share/page/modules/deploy`

## Installation

Build alfresco-clipboard-repo AMP and alfresco-clipboard-share AMP (see section Building). 
* Copy alfresco-clipboard-repo to `amps` directory of your webserver instance.
* Copy alfresco-clipboard-share to `amps_share` directory of your webserver instance.
* Apply extension modules using the `bin/apply_amps.[sh|bat]`on your server.
* Restart webserver
* Enable the Clipboard: Go to the Share Module Management Compontent and enable the Share Clipboard: `http://<yourserver>/share/page/modules/deploy`
