/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

function onLoaded () {
	var csInterface = new CSInterface();

	var env = csInterface.hostEnvironment;
	var appName 	= csInterface.hostEnvironment.appName;
	var appVersion 	= csInterface.hostEnvironment.appVersion;
	var APIVersion	= csInterface.getCurrentApiVersion();

	var caps = csInterface.getHostCapabilities();
	
	loadJSX();
	
	updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);

	// Update the color of the panel when the theme color of the product changed.
	csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
	// Listen for event sent in response to rendering a sequence.
	csInterface.addEventListener("com.adobe.csxs.events.PProPanelRenderEvent", function(event) {
		alert(event.data);
	});

	csInterface.addEventListener("com.adobe.csxs.events.WorkspaceChanged", function(event) {
		alert("New workspace selected: " + event.data);
	});

	csInterface.addEventListener("com.adobe.ccx.start.handleLicenseBanner", function(event) {
		alert("User chose to go \"Home\", wherever that is...");
	});

	csInterface.addEventListener("ApplicationBeforeQuit", function(event) {
		csInterface.evalScript("$._PPP_.closeLog()");
	});

	csInterface.evalScript("$._PPP_.getUserName()", myUserNameFunction);  
	csInterface.evalScript("$._PPP_.keepPanelLoaded()");
	csInterface.evalScript("$._PPP_.disableImportWorkspaceWithProjects()");
	csInterface.evalScript("$._PPP_.registerProjectPanelSelectionChangedFxn()");  	// Project panel selection changed
	csInterface.evalScript("$._PPP_.registerItemAddedFxn()");					  	// Item added to project
	csInterface.evalScript("$._PPP_.registerProjectChangedFxn()");					// Project changed
	csInterface.evalScript("$._PPP_.registerSequenceSelectionChangedFxn()");		// Selection within the active sequence changed
	csInterface.evalScript("$._PPP_.registerSequenceActivatedFxn()");				// The active sequence changed
	csInterface.evalScript("$._PPP_.registerActiveSequenceStructureChangedFxn()");	// Clips within the active sequence changed
	csInterface.evalScript("$._PPP_.registerItemsAddedToProjectFxn()");  // register for message, whenever something is added to the active project
	csInterface.evalScript("$._PPP_.registerSequenceMessaging()");			
	csInterface.evalScript("$._PPP_.registerActiveSequenceChangedFxn()");	
	csInterface.evalScript("$._PPP_.confirmPProHostVersion()");
	csInterface.evalScript("$._PPP_.forceLogfilesOn()");  // turn on log files when launching

	// Good idea from our friends at Evolphin; make the ExtendScript locale match the JavaScript locale!
	var prefix		= "$._PPP_.setLocale('";
	var locale	 	= csInterface.hostEnvironment.appUILocale;
	var postfix		= "');";

	var entireCallWithParams = prefix + locale + postfix;
	csInterface.evalScript(entireCallWithParams);
}

function dragHandler(event) {
	var csInterface = new CSInterface();
	var extPath 	= csInterface.getSystemPath(SystemPath.EXTENSION);
	var OSVersion	= csInterface.getOSInformation();

	/*
		Note: PPro displays different behavior, depending on where the drag ends (and over which the panel has no control):

		Project panel?	Import into project.
		Sequence?		Import into project, add to sequence.
		Source monitor? Open in source, but do NOT import into project.
	
	*/
	
	if (extPath !== null) {
		extPath = extPath + "/payloads/test.jpg";
		if (OSVersion.indexOf("Windows") >=0) {
			var sep = "\\\\";
			extPath = extPath.replace(/\//g, sep);
		}
		event.dataTransfer.setData("com.adobe.cep.dnd.file.0", extPath);
	//	event.dataTransfer.setData("com.adobe.cep.dnd.file.N", path);  N = (items to import - 1)
	}
}

function myCallBackFunction (data) {
	// Updates seq_display with whatever ExtendScript function returns.
	var boilerPlate		= "Active Sequence: ";
	var seq_display		= document.getElementById("active_seq");
	seq_display.innerHTML	= boilerPlate + data;
}

function myUserNameFunction (data) {
	// Updates username with whatever ExtendScript function returns.
	var user_name		= document.getElementById("username");
	user_name.innerHTML	= data;
}

function myGetProxyFunction (data) {
	// Updates proxy_display based on current sequence's value.
	var boilerPlate		   = "Proxies enabled for project: ";
	var proxy_display	   = document.getElementById("proxies_on");

	if (proxy_display !== null) {
		proxy_display.innerHTML = boilerPlate + data;
	}
}

function mySetProxyFunction (data) {
	var csInterface = new CSInterface();
	csInterface.evalScript("$._PPP_.getActiveSequenceName()", myCallBackFunction);
	csInterface.evalScript("$._PPP_.getProjectProxySetting()", myGetProxyFunction);
}

function myVersionInfoFunction (data) {
	var v_string		= document.getElementById("version_string");
	v_string.innerHTML	= data;
}

/**
 * Update the theme with the AppSkinInfo retrieved from the host product.
 */

function updateThemeWithAppSkinInfo(appSkinInfo) {

	//Update the background color of the panel

	var panelBackgroundColor = appSkinInfo.panelBackgroundColor.color;
	document.body.bgColor 	= toHex(panelBackgroundColor);

	var styleId 			= "ppstyle";
	var gradientBg			= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 40) + " , " + toHex(panelBackgroundColor, 10) + ");";
	var gradientDisabledBg	= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, 15) + " , " + toHex(panelBackgroundColor, 5) + ");";
	var boxShadow			= "-webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 1px rgba(0, 0, 0, 0.2);";
	var boxActiveShadow		= "-webkit-box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.6);";

	var isPanelThemeLight	= panelBackgroundColor.red > 50; // choose your own sweet spot
	var fontColor, disabledFontColor, borderColor, inputBackgroundColor, gradientHighlightBg;

	if(isPanelThemeLight) {
		fontColor				= "#000000;";
		disabledFontColor		= "color:" + toHex(panelBackgroundColor, -70) + ";";
		borderColor				= "border-color: " + toHex(panelBackgroundColor, -90) + ";";
		inputBackgroundColor	= toHex(panelBackgroundColor, 54) + ";";
		gradientHighlightBg		= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -40) + " , " + toHex(panelBackgroundColor,-50) + ");";
	} else {
		fontColor				= "#ffffff;";
		disabledFontColor		= "color:" + toHex(panelBackgroundColor, 100) + ";";
		borderColor				= "border-color: " + toHex(panelBackgroundColor, -45) + ";";
		inputBackgroundColor	= toHex(panelBackgroundColor, -20) + ";";
		gradientHighlightBg		= "background-image: -webkit-linear-gradient(top, " + toHex(panelBackgroundColor, -20) + " , " + toHex(panelBackgroundColor, -30) + ");";
	}
	
	//Update the default text style with pp values

	addRule(styleId, ".default", "font-size:" + appSkinInfo.baseFontSize + "px" + "; color:" + fontColor + "; background-color:" + toHex(panelBackgroundColor) + ";");
	addRule(styleId, "button, select, input[type=text], input[type=button], input[type=submit]", borderColor);	   
	addRule(styleId, "p", "color:" + fontColor + ";");	  
	addRule(styleId, "h1", "color:" + fontColor + ";");	  
	addRule(styleId, "h2", "color:" + fontColor + ";");	  
	addRule(styleId, "button", "font-family: " + appSkinInfo.baseFontFamily + ", Arial, sans-serif;");	  
	addRule(styleId, "button", "color:" + fontColor + ";");	   
	addRule(styleId, "button", "font-size:" + (1.2 * appSkinInfo.baseFontSize) + "px;");	
	addRule(styleId, "button, select, input[type=button], input[type=submit]", gradientBg);	
	addRule(styleId, "button, select, input[type=button], input[type=submit]", boxShadow);
	addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", gradientHighlightBg);
	addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", boxActiveShadow);
	addRule(styleId, "[disabled]", gradientDisabledBg);
	addRule(styleId, "[disabled]", disabledFontColor);
	addRule(styleId, "input[type=text]", "padding:1px 3px;");
	addRule(styleId, "input[type=text]", "background-color: " + inputBackgroundColor + ";");
	addRule(styleId, "input[type=text]:focus", "background-color: #ffffff;");
	addRule(styleId, "input[type=text]:focus", "color: #000000;");
}

function addRule(stylesheetId, selector, rule) {
	var stylesheet = document.getElementById(stylesheetId);
	if (stylesheet) {
		stylesheet = stylesheet.sheet;
		if( stylesheet.addRule ) {
			stylesheet.addRule(selector, rule);
		} else if( stylesheet.insertRule ) {
			stylesheet.insertRule(selector + " { " + rule + " }", stylesheet.cssRules.length);
		}
	}
}

function reverseColor(color, delta) {
	return toHex({red:Math.abs(255-color.red), green:Math.abs(255-color.green), blue:Math.abs(255-color.blue)}, delta);
}

/**
 * Convert the Color object to string in hexadecimal format;
 */

function computeValue(value, delta) {
	var computedValue = !isNaN(delta) ? value + delta : value;
	if (computedValue < 0) {
		computedValue = 0;
	} else if (computedValue > 255) {
		computedValue = 255;
	}

	computedValue = Math.round(computedValue).toString(16);
	return computedValue.length == 1 ? "0" + computedValue : computedValue;
}

function toHex(color, delta) {

	var hex = "";
	if (color) {
		hex = computeValue(color.red, delta) + computeValue(color.green, delta) + computeValue(color.blue, delta);
	}
	return "#" + hex;
}

function onAppThemeColorChanged(event) {
	// Should get a latest HostEnvironment object from application.
	var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
	// Gets the style information such as color info from the skinInfo, 
	// and redraw all UI controls of your extension according to the style info.
	updateThemeWithAppSkinInfo(skinInfo);
} 

/**
* Load JSX file into the scripting context of the product. All the jsx files in 
* folder [ExtensionRoot]/jsx & [ExtensionRoot]/jsx/[AppName] will be loaded.
*/
function loadJSX() {
	var csInterface = new CSInterface();

	// get the appName of the currently used app. For Premiere Pro it's "PPRO"
	var appName = csInterface.hostEnvironment.appName;
	var extensionPath = csInterface.getSystemPath(SystemPath.EXTENSION);

	// load general JSX script independent of appName
	var extensionRootGeneral = extensionPath + "/jsx/";
	csInterface.evalScript("$._ext.evalFiles(\"" + extensionRootGeneral + "\")");

	// load JSX scripts based on appName
	var extensionRootApp = extensionPath + "/jsx/" + appName + "/";
	csInterface.evalScript("$._ext.evalFiles(\"" + extensionRootApp + "\")");
}

function evalScript(script, callback) {
	new CSInterface().evalScript(script, callback);
}

function onClickButton(ppid) {
	var extScript = "$._ext_" + ppid + ".run()";
	evalScript(extScript);
}

function addKeyframe() {
	var csInterface = new CSInterface();
	csInterface.evalScript("addKeyframeToCurrentClip()");
}

document.addEventListener("DOMContentLoaded", () => {
	const propertyRows = document.querySelectorAll('.property-row');
	const trackRows = document.querySelectorAll('.track-row');
	const clearKeyframeButton = document.querySelector('#btn_PPRO2');
	let currentProperty = 'opacity'; // Default property selected

	// Initialize keyframes object with properties as keys
	const keyframes = {
			opacity: [],
			position: [],
			scale: [],
			rotation: []
	};

	function renderKeyframes() {
			// Clear existing keyframes in the DOM
			trackRows.forEach(row => {
					row.innerHTML = '';
			});

			keyframes[currentProperty].forEach(keyframe => {
					const trackRow = document.querySelector(`.track-row[data-property="${currentProperty}"]`);
					const keyframeEl = document.createElement('div');
					keyframeEl.classList.add('keyframe');
					keyframeEl.style.left = `${keyframe.time * 100}px`;
					keyframeEl.setAttribute('data-time', keyframe.time);

					keyframeEl.addEventListener('mousedown', (e) => {
							e.preventDefault();
							dragKeyframe(e, keyframe);
					});

					trackRow.appendChild(keyframeEl);
			});
	}

	function dragKeyframe(e, keyframe) {
			const trackRow = document.querySelector(`.track-row[data-property="${currentProperty}"]`);
			const trackRect = trackRow.getBoundingClientRect();
			let startX = e.clientX;

			function onMouseMove(e) {
					const newTime = Math.max(0, Math.min((e.clientX - trackRect.left) / 100, trackRect.width / 100));
					keyframe.time = newTime;
					renderKeyframes();
			}

			function onMouseUp() {
					document.removeEventListener('mousemove', onMouseMove);
					document.removeEventListener('mouseup', onMouseUp);
			}

			document.addEventListener('mousemove', onMouseMove);
			document.addEventListener('mouseup', onMouseUp);
	}

	function clearKeyframes() {
			const trackRow = document.querySelector(`.track-row[data-property="${currentProperty}"]`);
			trackRow.replaceChildren(); // Clears the DOM elements for the current property

			keyframes[currentProperty] = []; // Clears the keyframes for the current property
	}

	propertyRows.forEach(row => {
			row.addEventListener('click', (e) => {
					currentProperty = e.target.dataset.property; // Update current property
					renderKeyframes(); // Render keyframes for the selected property
			});
	});

	trackRows.forEach(row => {
			row.addEventListener('dblclick', (e) => {
					const trackRect = e.target.getBoundingClientRect();
					const newTime = (e.clientX - trackRect.left) / 100;
					keyframes[currentProperty].push({ time: newTime });
					renderKeyframes();
			});
	});

	clearKeyframeButton.addEventListener('click', (e) => clearKeyframes());

	const csInterface = new CSInterface();

	function getSelectedComponents() {
			csInterface.evalScript('getSelectedItemComponents()', (result) => {
					const components = JSON.parse(result);
					renderProperties(components);
			});
	}

	// Listen for custom event from ExtendScript
	csInterface.addEventListener("com.mycompany.updateClipProperties", (event) => {
		console.log('Received data:', event.data);  // Log the event data to inspect it
		const components = simpleDeserialize(event.data);
		renderProperties(components);
});

function renderProperties(components) {
	const propertyContainer = document.querySelector('#propertyRows');
	const trackContainer = document.querySelector('#trackContainer');

	// Clear previous properties and tracks
	propertyContainer.innerHTML = '';
	trackContainer.innerHTML = '';

	if (!Array.isArray(components)) {
			console.error("Expected components to be an array, but got:", components);
			return;
	}

	components.forEach(component => {
			if (!component || !component.properties) {
					console.error("Component or properties is undefined:", component);
					return;
			}

			// Create a row for each component in the properties list
			const propertyRow = document.createElement('div');
			propertyRow.classList.add('property-row');
			propertyRow.textContent = component.name;
			propertyContainer.appendChild(propertyRow);

			// Create a corresponding track row for the timeline
			const trackRow = document.createElement('div');
			trackRow.classList.add('track-row');
			trackRow.setAttribute('data-property', component.name.toLowerCase());
			trackContainer.appendChild(trackRow);

			// Add properties to the component row
			component.properties.forEach(property => {
					const propertyDetail = document.createElement('div');
					propertyDetail.classList.add('property-detail');
					propertyDetail.textContent = `${property.name}: ${property.value}`;
					propertyRow.appendChild(propertyDetail);
			});
	});
}

	// document.querySelector('#btn_PPRO3').addEventListener('click', getSelectedComponents);

	renderKeyframes();
});


function simpleDeserialize(serializedString) {
	if (!serializedString) return null; // Check if the string is empty or undefined

	if (serializedString[0] === '[') {
			// Deserialize an array
			var arrayContent = serializedString.slice(1, -1); // Remove the square brackets
			var items = arrayContent ? arrayContent.split(/\|(?=[^\[\]]*(?:\[|$))/) : []; // Split on '|' not inside brackets
			return items.map(function(item) {
					return simpleDeserialize(item);
			});
	} else if (serializedString[0] === '{') {
			// Deserialize an object
			var objectContent = serializedString.slice(1, -1); // Remove the curly braces
			var keyValues = objectContent ? objectContent.split(/,(?![^\{]*\})/) : []; // Split on commas outside of curly braces
			var obj = {};
			keyValues.forEach(function(keyValue) {
					var keyValuePair = keyValue.split(/:(.+)/); // Split only on the first colon
					var key = keyValuePair[0];
					var value = simpleDeserialize(keyValuePair[1]);
					obj[key] = value;
			});
			return obj;
	} else {
			// Primitive types (assumed to be strings or numbers)
			if (serializedString === "true") return true;
			if (serializedString === "false") return false;
			return isNaN(serializedString) ? serializedString : Number(serializedString);
	}
}


