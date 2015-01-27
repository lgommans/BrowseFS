// Usage: new Fs("http://[::1]:1337/", "/home/luc", document.body);
// Any other functions in the class are not to be used.

var Fs = function(server, initialPath, domElement) {
	console.log("starting2");
	this.currentPath = initialPath;
	this.server = server;

	this.init(domElement);
};

Fs.prototype.newDiv = function(appendTo) {
	var el = document.createElement("div");
	appendTo.appendChild(el);
};

Fs.prototype.init = function(domElement) {
	console.log(domElement);
	this.rootElement = this.newDiv(domElement);

	this.contentElement = this.newDiv(this.rootElement);
	this.statusElement = this.newDiv(this.rootElement);

	this.displayFolder(this.currentPath);
};

Fs.prototype.displayFolder = function(path) {
	var data = this.getDirectory(path, this.displayData, function(data) {
		// Error
		console.log("Error in getDirectory: " + data);
	});
};

Fs.prototype.displayData = function(data) {
	data = this.decode(data);
	
	this.statusElement.innerHTML = "Status: Ready";
	this.contentElement.innerHTML = "";
	for (var i in data.dirs) {
		this.newTile(i, true);
	}
	this.contentElement.innerHTML += "<hr/>";
	for (var i in data.files) {
		this.newTile(i);
	}
};

Fs.prototype.newTile = new function(item, isDir) {
	this.contentElement.innerHTML += "&lt;" + item + "&gt; ";
};

Fs.prototype.getDirectory = function(path, success, error) {
	this.statusElement.innerHTML = "Status: Busy...";
	this.aGET(this.server + "getDirectory/" + path.substring(1), success, error);	
};

Fs.prototype.aGET = function(uri, callback, errorcallback) {
	var req = new XMLHttpRequest();
	req.open("GET", uri, true);
	req.send(null);
	req.onreadystatechange = function() {
		if (req.readyState == 4) {
			callback(req.responseText);
		}
		if (req.readyState == 5) {
			errorcallback(req.responseText);
		}
	}
};

Fs.prototype.decode = function(rawData) {
	var result = {dirs: [], files: []};
	while (rawData.length > 0) {
		// Data is structured "int,data" (without quotes) where the int is the data's length.
		// First find the comma...
		var commapos = rawData.indexOf(",");
		if (commapos == -1) {
			return console.log("No comma found while there is still data. Wtf?");
		}
		// ... then we know the length of the data...
		var len = parseInt(rawData.substring(0, commapos));
		// ... then we can grab the data...
		var item = rawData.substring(commapos + 1, len);
		// ... and finally we can shorten the data left to parse.
		rawData = rawData.substring(commapos + 1 + len);

		// Any item starting with a slash is a directory, everything else a file.
		if (item.charAt(0) == "/") {
			result.dirs.push(item);
		}
		else {
			result.files.push(item);
		}
	}

	return result;
};

