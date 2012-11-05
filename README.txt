
Alfresco Share Clipboard
=============================================================

This project defines a Share Clipboard that allows collecting documents in Alfresco
Share.

Installation
------------

The alfresco-share-clipboard.jar needs to be copied into this folder in the tomcat
shared classes folder:

  tomcat/webapps/share/WEB-INF/lib/
 

Building
--------

To build the individual JAR files, run the following command from the base 
project directory.

    ant -Dalfresco.sdk.dir=c:\dev\sdks\alfresco-enterprise-sdk-4.0.0 clean dist-jar

The command should build a JAR file named alfresco-share-clipboard.jar in the 
'build/dist' directory within your project.

To deploy the extension files into a local Tomcat instance for testing, you can 
use the hotcopy-tomcat-jar task. You will need to set the tomcat.home
property in Ant.

    ant -Dtomcat.home=C:/Alfresco/tomcat clean hotcopy-tomcat-jar
    
Once you have run this you will need to restart Tomcat so that the classpath 
resources in the JAR file are picked up.


Using the component
-------------------

Go to the Share Module Management Compontent and enable the Share Clipboard:

http://localhost:8080/share/page/modules/deploy
