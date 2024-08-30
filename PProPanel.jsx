/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
* Copyright 2014 Adobe
* All Rights Reserved.
*
* NOTICE: Adobe permits you to use, modify, and distribute this file in
* accordance with the terms of the Adobe license agreement accompanying
* it. If you have received this file from a source other than Adobe,
* then your use, modification, or distribution of it requires the prior
* written permission of Adobe. 
**************************************************************************/
if(typeof($)=='undefined') {
	$={};
}

$._ext = {
	//Evaluate a file and catch the exception.
	evalFile : function(path) {
		try {
			$.evalFile(path);
		} catch (e) {alert("Exception:" + e);}
	},
	// Evaluate all the files in the given folder 
	evalFiles: function(jsxFolderPath) {
		var folder = new Folder(jsxFolderPath);
		if (folder.exists) {
			var jsxFiles = folder.getFiles("*.jsx");
			for (var i = 0; i < jsxFiles.length; i++) {
				var jsxFile = jsxFiles[i];
				$._ext.evalFile(jsxFile);
			}
		}
	},
	// entry-point function to call scripts more easily & reliably
	callScript: function(dataStr) {
		try {
			var dataObj = JSON.parse(decodeURIComponent(dataStr));
			if (
				!dataObj ||
				!dataObj.namespace ||
				!dataObj.scriptName ||
				!dataObj.args
			) {
				throw new Error('Did not provide all needed info to callScript!');
			}
			// call the specified jsx-function
			var result = $[dataObj.namespace][dataObj.scriptName].apply(
				null,
				dataObj.args
			);
			// build the payload-object to return
			var payload = {
				err: 0,
				result: result
			};
			return encodeURIComponent(JSON.stringify(payload));
		} catch (err) {
			var payload = {
				err: err
			};
			return encodeURIComponent(JSON.stringify(payload));
		}
	},
};

function addKeyframeToCurrentClip() {
    app.enableQE();

    var sequence = app.project.activeSequence;

    if (sequence) {
        var currentTime = sequence.getPlayerPosition();
        $.writeln(currentTime.seconds)

        for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
            var videoTrack = sequence.videoTracks[i];

            for (var j = 0; j < videoTrack.clips.numItems; j++) {
                var clip = videoTrack.clips[j];

                if (clip.isSelected()) {
                    var component = clip.components
                    var properties = component[1].properties
                    var property = properties[1];
                    if (property) {
                        $.writeln(property.displayName)
                        $.writeln(property.areKeyframesSupported())
                        property.setTimeVarying(true);
                        property.addKey(currentTime);
                        property.setValueAtKey(currentTime, 50, 1);
                        var keyframeValue = property.getValueAtKey(currentTime);
                        if (keyframeValue !== null) {
                            $.writeln(property.getKeys())
                            alert("Keyframe added at " + currentTime + " with value: " + keyframeValue);
                        } else {
                            alert("Keyframe not added.");
                        }

                    } else {
                        alert("Could not find the property to add keyframe.");
                    }
                }
            }
        }
    } else {
        alert("No active sequence found.");
    }
}

function getSelectedItemComponents() {
	app.enableQE(); // Enables the QE DOM

	var sequence = app.project.activeSequence; // Get the active sequence

	if (sequence) {
			for (var i = 0; i < sequence.videoTracks.numTracks; i++) {
					var videoTrack = sequence.videoTracks[i];

					for (var j = 0; j < videoTrack.clips.numItems; j++) {
							var clip = videoTrack.clips[j];

							if (clip.isSelected()) {
									var componentList = [];

									// Loop through all components of the clip
									for (var k = 0; k < clip.components.length; k++) {
											var component = clip.components[k];
											var propertyList = [];

											// Loop through all properties of each component
											for (var l = 0; l < component.properties.length; l++) {
													var property = component.properties[l];
													propertyList.push({
															name: property.displayName,
															value: property.getValue() // Get the current value of the property
													});
											}

											// Push the component and its properties into the list
											componentList.push({
													name: component.displayName,
													properties: propertyList
											});
									}

									// Return the components as a JSON string
									return JSON.stringify(componentList);
							}
					}
			}
	}

	return JSON.stringify([]);
}