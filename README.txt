
Alfresco Share Clipbaord
=============================================================

This project defines a Share Clipboard that allows collecting documents in Alfresco
Share.

Installation
------------

The alfresco-shrare-clipboard.jar needs to be copied into this folder in the Share webapp:

  tomcat/webapps/share/WEB-INF/lib/
  
The deployment location has changed recently (with Javascript Console 0.5)
because the Javascript Console now uses Java classes that have to be deployed 
to these locations and can NOT reside in tomcat/shared/lib anymore.


Building
--------

To build the individual JAR files, run the following command from the base 
project directory.

    ant -Dalfresco.sdk.dir=c:\dev\sdks\alfresco-enterprise-sdk-4.0.0 clean dist-jar

The command should build a JAR file named javascript-console-repo.jar or
javascript-console-share.jar in the 'dist' directory within your project.

There also is the javascript-console-dist which builds both jar files and 
creates a patched version for Alfresco 3.4.x which does not support all the 
features of the version for 4.0.x

To deploy the extension files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.


Using the component
-------------------

Log in to Alfresco Share as an admin user and navigate to the Administration
page. Click 'Javascript Console' in the left hand side navigation.

