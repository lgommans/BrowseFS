// Usage: new Fs("http://[::1]:1337/", "/home/luc", document.body);
// Any other functions in the class are not to be used.

var Fs = function(server, initialPath, domElement) {
	this.currentPath = initialPath;
	this.server = server;

	this.init(domElement);
};

Fs.prototype.newDiv = function(appendTo) {
	var el = document.createElement("div");
	appendTo.appendChild(el);
	return el;
};

Fs.prototype.init = function(domElement) {
	this.rootElement = this.newDiv(domElement);

	this.contentElement = this.newDiv(this.rootElement);
	this.statusElement = this.newDiv(this.rootElement);

	this.displayFolder(this.currentPath);
};

Fs.prototype.displayFolder = function(path) {
	this.statusElement.innerHTML = "Status: Busy...";

	var data = this.GET(this.server + "getDirectory/" + path.substring(1));
	data = this.decode(data);
	
	this.statusElement.innerHTML = "Status: Ready";
	this.contentElement.innerHTML = "";
	for (var i in data.dirs) {
		this.newTile(data.dirs[i], true);
	}
	this.contentElement.innerHTML += "<hr/>";
	for (var i in data.files) {
		this.newTile(data.files[i]);
	}
};

Fs.prototype.newTile = function(item, isDir) {
	this.contentElement.innerHTML += "&lt;" + item + "&gt; ";
};

Fs.prototype.GET = function(uri) {
	var req = new XMLHttpRequest();
	req.open("GET", uri, false);
	req.send(null);
	return req.responseText;
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
		var item = rawData.substring(commapos + 1, len + commapos + 1);
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

Fs.prototype.dummy = function(asdf) {
	console.log("Dummy!" + asdf);
}

