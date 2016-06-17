<@markup id="css" >
	<@link rel="stylesheet" type="text/css" href="${url.context}/res/components/clipboard/clipboard-menu.css" group="documentlibrary" />
</@>

<@markup id="js">
	<@script type="text/javascript" src="${url.context}/res/components/clipboard/clipboard-menu.js" group="documentlibrary"></@script>
</@>


<@markup id="widgets">
	<@uniqueIdDiv>
		<#assign el=args.htmlid?html>
		<@inlineScript group="clipboard-menu">
			new Alfresco.module.Clipboard("${el}").setOptions({
			}).setMessages(${messages});
		</@>
	</@>
</@>

<@markup id="html">
	<@uniqueIdDiv>
	</@>
</@>
