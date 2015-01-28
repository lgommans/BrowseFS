// Usage: new Fs("http://[::1]:1337/", "/home/luc", document.body);
// Any other functions in the class are not to be used. Though you can hack away if you like, just no warranties :)

// == CONSTRUCTOR ==
var Fs = function(server, initialPath, domElement) {
	// Parameter checking
	if (!domElement) {
		domElement = document.body;
	}

	if (!initialPath) {
		initialPath = "/";
	}

	if (!server) {
		console.log("No server defined. Using relative paths on this server.");
		server = "./";
	}

	// Global FS object
	FS = this;
	this.currentPath = initialPath.substring(1);
	this.server = server;
	this.selected = []; // Selected items

	// Initialize DOM elements
	this.rootElement = this.newDiv(domElement);
	this.topControls = this.newDiv(this.rootElement); // !TODO: use this
	this.contentElement = this.newDiv(this.rootElement);

	// Start!
	this.displayFolder(this.currentPath);
};

// == METHODS ==
Fs.prototype.newDiv = function(appendTo) {
	var el = document.createElement("div");
	appendTo.appendChild(el);
	return el;
};

Fs.prototype.cd = function(relativePath) {
	// TODO: Resolve relative paths
	this.currentPath += "/" + relativePath;
	this.displayFolder(this.currentPath);

	// Selections are in a current folder only, so since we are changing directory we want to empty the selection
	this.selected = [];
};

Fs.prototype.displayFolder = function(path) {
	var data = this.GET(this.server + "getDirectory/" + path);
	data = this.decode(data);

	data.dirs.sort(this.itemSort);
	
	this.contentElement.innerHTML = "";
	for (var i in data.dirs) {
		this.newTile(data.dirs[i], true);
	}
	var newline = this.newDiv(this.contentElement); // Add a newline/break
	newline.style.borderTop = "1px solid grey";
	newline.style.margin = "2px 0px 2px 0px";
	for (var i in data.files) {
		this.newTile(data.files[i]);
	}
};

Fs.prototype.itemSort = function(a, b) {
	if (a.name.charAt(0) == "." && b.name.charAt(0) != ".") {
		return 1;
	}
	if (a.name.charAt(0) != "." && b.name.charAt(0) == ".") {
		return -1;
	}
	if (!a.favorite && b.favorite) {
		return 1;
	}
	if (a.favorite && !b.favorite) {
		return -1;
	}
	if (a.name.toLowerCase() > b.name.toLowerCase()) {
		return 1;
	}
	if (a.name.toLowerCase() < b.name.toLowerCase()) {
		return -1;
	}
	return 0;
};

Fs.prototype.newTile = function(item, isDir) {
	var fav = item.favorite;
	var name = item.name;

	var div = this.newDiv(this.contentElement);
	var icon = this.newDiv(div);
	var content = this.newDiv(div);

	div.style.margin = "8px";
	div.style.display = "inline-block";
	div.style.boxShadow = "0px 1px 1px 0px rgba(255, 255, 255, 0.2)";
	div.style.height = "20px";
	div.style.background = "#0f0f00";
	div.style.color = "white";

	icon.style.width = "30px";
	icon.style.height = "20px";
	icon.style.display = "inline-block";
	icon.style.boxShadow = "1px 2px 3px 0px rgba(127, 127, 127, 0.8)";
	icon.style.marginRight = "8px";

	content.style.width = "140px";
	content.style.height = "20px";
	content.style.display = "inline-block";
	content.style.overflow = "hidden";
	content.style.float = "right";
	content.style.whiteSpace = "nowarp";

	div.selected = false;
	div.value = name;
	div.favorite = fav;
	div.isDir = isDir;

	icon.innerHTML = "<3";
	if (fav) {
		icon.style.color = "red";
	}
	else {
		icon.style.color = "white";
	}
	content.innerHTML = name;

	div.addEventListener('click', function(ev) {
		div.selected = !div.selected;
		if (div.selected) {
			div.style.background = "#4285F4"; // Blue
			FS.selected.push(div.value);
		}
		else {
			div.style.background = "#0f0f00";
			div.style.boxShadow = "0px 1px 1px 0px rgba(0, 0, 0, 0.2)";
			FS.selected.splice(FS.selected.indexOf(div.value));
		}
	});

	div.addEventListener('dblclick', function(ev) {
		if (div.isDir) {
			FS.cd(div.value);
		}
		else {
			FS.open(div.value);
		}
        document.getSelection().removeAllRanges();
	});

	icon.addEventListener('click', function(ev) {
		FS.toggleFavorite(name);
	});
};

Fs.prototype.toggleFavorite = function(name) {
	this.GET(this.server + "toggleFavorite/" + this.currentPath + "/" + name);
	this.cancelBubbling(ev);
	this.reloadFolder();
}

// Opens a file on the system (calling to the API)
Fs.prototype.open = function(fname) {
	this.GET(this.server + "open/3/" + this.currentPath + "/" + fname);
};

Fs.prototype.reloadFolder = function() {
	this.displayFolder(this.currentPath);
};

Fs.prototype.cancelBubbling = function(ev) {
	var evt = ev ? ev : window.event;
	if (evt.stopPropagation) evt.stopPropagation();
	if (evt.cancelBubble != null) evt.cancelBubble = true;
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

		// Check whether this item is a favorite
		var f = false;
		if (item.charAt(0) == "F") {
			f = true;
		}
		item = item.substring(1);

		// Any item starting with a slash is a directory, everything else a file.
		if (item.charAt(0) == "/") {
			item = item.substring(1);
			result.dirs.push({favorite: f, name: item});
		}
		else {
			result.files.push({favorite: f, name: item});
		}
	}

	return result;
};
