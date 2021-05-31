var iframes = document.getElementsByTagName("iframe");
for(var i = iframes.length; i--;){
	iframes[i].contentDocument.addEventListener("DOMNodeInserted", function(e) {
		if (e.target.tagName && e.target.tagName.toLowerCase() === 'iframe') {
			e.target.addEventListener("load", function(i) {
				if(i.target.contentDocument && !isScriptLoaded(i.target.contentDocument)){
				   addScript(i.target.contentDocument);
				   addStyleSheet(i.target.contentDocument);
				}
				handleTestMessagePrompt(e.target);
				handleSaveConfirmationPrompt(e.target);
			});
		}
	});
}

var scriptUrl = '/sitecore%20modules/MicrosoftTeamsIntegration/main.js'; 
function isScriptLoaded(iFrameDocument) {
    var scripts = iFrameDocument.getElementsByTagName('script');
    for (var i = scripts.length; i--;) {
        if (scripts[i].src.endsWith(scriptUrl)) return true;
    }
    return false;
}
	
function addScript(iFrameDocument){
	var scriptElement = iFrameDocument.createElement('script'); 
	scriptElement.type = 'text/javascript';
	scriptElement.src = scriptUrl;
	iFrameDocument.head.appendChild(scriptElement);
}

function addStyleSheet(iFrameDocument){
	var linkElement = iFrameDocument.createElement("link");
	linkElement.type = "text/css";
	linkElement.rel = "stylesheet";
	linkElement.href = "/sitecore modules/MicrosoftTeamsIntegration/main.css";
	iFrameDocument.head.appendChild(linkElement);
}

function main(){
	initializeTabs();
	initializeLinks();
}

function initializeTabs(){
	configureTooltips();
	appendAllOptionToDropdowns();	
}

function initializeLinks(){
	document.querySelector('[id*="publishAddOption"] a')?.setAttribute("onclick", "addPublishEntry();");
	document.querySelector('[id*="testEndpoint"] a')?.setAttribute("onclick", "sendTestMessage();");
	configureDeleteOptions();	
}

function handleTestMessagePrompt(iframe){
	if(iframe.src.indexOf('xmlcontrol=Prompt') > 0){
		iframe.contentDocument.getElementById('Value').value = window.top.document.getElementById('testEndpointUrl').value;
		iframe.contentDocument.getElementById('OK').click();
	}
}

function handleSaveConfirmationPrompt(iframe){
	if(iframe.src.indexOf('xmlcontrol=YesNoCancel&te=Do+you+want+to+save+the+changes') > 0){
		iframe.contentDocument.querySelectorAll('button').forEach(function(i) { if(i.innerHTML === "Yes") i.click(); });
	}
}

function configureTooltips(){
	document.querySelectorAll('[data-parent-group-id="4"]').forEach(function(element) {
		element.setAttribute("title", getInnerText(element));
	});
}	

function configureDeleteOptions(){
	var publishEntries = document.querySelectorAll('[data-parent-group-id="4"]');
	for(var i=0; i < publishEntries.length; i=i+5){
		var notificationSetting = `${getInnerText(publishEntries[i])}=${getInnerText(publishEntries[i+1])}|${getInnerText(publishEntries[i+2])}|${getInnerText(publishEntries[i+3])}`;
		publishEntries[i+4].getElementsByTagName('a')[0].setAttribute("onclick", "deletePublishEntry(this, '" + encodeURI(notificationSetting) + "');");
	}
}

function sendTestMessage(){
	var testEndpointUrl = document.querySelector('textarea[id*="endpoint"]').value;
	var hiddenElement = window.top.document.getElementById('testEndpointUrl');
	if(hiddenElement){
		hiddenElement.value = testEndpointUrl;
	}
	else{
		hiddentElement = window.top.document.createElement('input'); 
		hiddentElement.type = 'text/hidden';
		hiddentElement.id = 'testEndpointUrl';
		hiddentElement.value = testEndpointUrl;
		window.top.document.body.appendChild(hiddentElement);		
	}
	
	scForm.postEvent(this,event,'item:executescript(script={D478C9F0-6774-4EF9-AE6A-FDC1048C3CF9},scriptDb=master)')
}

function getInnerText(element){
	return element.getElementsByTagName('span')[0]?.innerHTML;
}

function appendAllOptionToDropdowns(){
	document.querySelectorAll("select").forEach(function(select){
		select.firstChild.text = 'All';
		select.firstChild.value = '';
	});
}

function addPublishEntry(){
	var publishTabContainer = document.getElementById('Tabstrip_tabpage_2').childNodes[0];
	var publishEntriesTemplate = document.querySelectorAll('[data-parent-group-id="3"]');
	var addPublishEntryNodes = document.querySelectorAll('[data-parent-group-id="5"]');
	if(addPublishEntryNodes[0].querySelectorAll("input")[0].value != ''){
		var i = -1;
		var notificationSetting = '&';
		do{
			i++;
			var clonedNode = publishEntriesTemplate[i].cloneNode(true);
			var addPublishEntryElement = addPublishEntryNodes[i].querySelectorAll("input, select")[0];
			if(addPublishEntryElement){
				var clonedTextNode = clonedNode.querySelectorAll("span")[0];
				clonedTextNode.innerHTML = clonedTextNode.title = addPublishEntryElement.tagName.toLowerCase() === 'select' ? addPublishEntryElement.options[addPublishEntryElement.selectedIndex].text : addPublishEntryElement.type.toLowerCase() === 'checkbox' ? addPublishEntryElement.checked : addPublishEntryElement.value;
				addPublishEntryElement.value = ''; 
				notificationSetting += clonedTextNode.innerHTML + '|';
			}
			else{
				notificationSetting = encodeURI(notificationSetting.replace('|', '=').replace(/\|$/, ""));
				clonedNode.querySelector('a').setAttribute("onclick", "deletePublishEntry(this, '" + notificationSetting + "');");
			}
			publishTabContainer.insertBefore(clonedNode, addPublishEntryNodes[0]); 
		} while(addPublishEntryNodes[i].querySelectorAll("a").length === 0);
		document.querySelector('[id*="publishLocationSelector_validator"]').innerHTML = '';
		
		var publishSettingsElement = document.querySelector('input[id*="publishNotificationSettings"]');
		publishSettingsElement.value += notificationSetting;
		publishSettingsElement.value = publishSettingsElement.value.replace(/^&/, "");
	}
	else{
		document.querySelector('[id*="publishLocationSelector_validator"]').innerHTML = 'Please select a content path';
	}
}

function deletePublishEntry(element, notificationSetting){
	var deleteButtonSection = element.closest('div[id*="publishDeleteOption"]');
	while (deleteButtonSection.previousSibling.id.indexOf('publishDeleteOption') === -1){
		deleteButtonSection.previousSibling.remove();
	}
	deleteButtonSection.remove();
	
	var publishSettingsElement = document.querySelector('input[id*="publishNotificationSettings"]');
	publishSettingsElement.value = publishSettingsElement.value.replace(notificationSetting, "");
	publishSettingsElement.value = publishSettingsElement.value.replace(/^&/, "").replace(/\&$/, "");
}

main();

