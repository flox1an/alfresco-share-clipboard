<@markup id="css" >
   <#-- CSS Dependencies -->
   <@link rel="stylesheet" type="text/css" href="${url.context}/res/components/clipboard/clipboard-list.css" group="documentlibrary"/>
</@>
<@markup id="js">
    <#-- JavaScript Dependencies -->
   <@script type="text/javascript" src="${url.context}/res/components/clipboard/clipboard-list.js" group="documentlibrary"/>
</@>

<@markup id="widgets">
   <@createWidgets group="documentlibrary"/>
</@>

<@uniqueIdDiv>
   <@markup id="html">
      <#assign el=args.htmlid?html>   
      <div class="clipboard filter">
         <h2 id="${el}-h2">${msg("header.clipboard")}</h2>
          <ul class="filterLink" id="${el}-clipboard"></ul>
      </div>
   </@>
</@>