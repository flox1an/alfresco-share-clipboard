<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/slingshot/documentlibrary/action/action.lib.js">


function getUniqueChildName(parentNode, name)
{
   var i = 0;

   // check that no child for the given name exists
   var finalName = name;
   while (parentNode.childByNamePath(finalName) !== null && i < 100)
   {
	   finalName = name + "_" + ++i;
   }
   return finalName;
}

/**
 * Link multiple files action
 * @method POST
 */

/**
 * Entrypoint required by action.lib.js
 *
 * @method runAction
 * @param p_params {object} Object literal containing files array
 * @return {object|null} object representation of action results
 */
function runAction(p_params)
{
   var results = [],
      destNode = p_params.destNode,
      files = p_params.files,
      file, fileNode, result, nodeRef;

   // Must have array of files
   if (!files || files.length === 0)
   {
      status.setCode(status.STATUS_BAD_REQUEST, "No files.");
      return;
   }
   
   for (file in files)
   {
      nodeRef = files[file];
      result =
      {
         nodeRef: nodeRef,
         action: "linkFile",
         success: false
      };
      
      try
      {
         fileNode = search.findNode(nodeRef);
         if (fileNode === null)
         {
            result.id = file;
            result.nodeRef = nodeRef;
            result.success = false;
         }
         else
         {
            result.id = fileNode.name;
            result.type = fileNode.isContainer ? "folder" : "document";
            
            if (fileNode.isContainer)
            {
              //ignore container...linking containers is currently not supported via this extension
            }
            else
            {
               //result.nodeRef = fileNode.copy(destNode).nodeRef.toString();
               var linkProps =[];
               linkProps["cm:title"] = "Link to " + fileNode.name;
               linkProps["cm:destination"] = fileNode.nodeRef.toString();
               
               result.nodeRef = destNode.createNode(getUniqueChildName(destNode,"Link to " + fileNode.name + ".url"), "app:filelink", linkProps).nodeRef.toString();
            }
            result.success = (result.nodeRef !== null);
         }
      }
      catch (e)
      {
         result.id = file;
         result.nodeRef = nodeRef;
         result.success = false;
      }
      
      results.push(result);
   }

   return results;
}

/* Bootstrap action script */
main();
