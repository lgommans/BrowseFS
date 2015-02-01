// Usage: new BrowseFS("/home/luc", "http://[::1]:1337/", document.body);
// Any other functions in the class are not to be used. Though you can hack away if you like, just no warranties :)

var BrowseFS = function(initialPath, server, domElement) {
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

	// Global browseFS object
	browseFS = this;
	this.currentPath = initialPath.substring(1);
	this.server = server;
	this.selected = []; // Selected items

	// Initialize DOM elements
	this.rootElement = this.newDiv(domElement);
	this.headerElement = this.newDiv(this.rootElement);
	this.topControls = this.newDiv(this.rootElement);
	this.contentElement = this.newDiv(this.rootElement);
	this.breadcrumbsElement = this.newDiv(this.topControls);
	this.fileControls = this.newDiv(this.topControls);
	this.folderControls = this.newDiv(this.topControls);

	this.rootElement.classList.add("browseFSroot");
	this.headerElement.classList.add("browseFSheader");
	this.topControls.classList.add("browseFStopControls");
	this.breadcrumbsElement.classList.add("browseFSbreadcrumbs");

	this.headerElement.innerHTML = "BrowseFS";

	this.initializeControls();

	// Start!
	this.displayFolder(this.currentPath);
};

BrowseFS.prototype.initializeControls = function() {
	this.fileControls.classList.add("browseFSfileControls");
	this.folderControls.classList.add("browseFSfolderControls");

	var openButton = this.newDiv(this.folderControls);
	openButton.classList.add("browseFSbutton");
	openButton.classList.add("noselect");
	openButton.innerHTML = "O";
	openButton.addEventListener('click', function(ev) {
		browseFS.open();
	});

	var propertiesButton = this.newDiv(this.folderControls);
	propertiesButton.classList.add("browseFSbutton");
	propertiesButton.classList.add("noselect");
	propertiesButton.innerHTML = "P";
	propertiesButton.addEventListener('click', function(ev) {
		browseFS.properties();
	});
};

BrowseFS.prototype.properties = function() {
	if (this.selected.length == 0) {
		// show folder properties (e.g. filesize)
	}
	else {
		// show file(s) properties (e.g. a-, c- and m-time, filesize, etc.)
	}
};

BrowseFS.prototype.open = function() {
	if (this.selected.length == 0) {
		// open current directory
	}
	else {
		// open selected file(s)
	}
};

BrowseFS.prototype.showPasteButton = function() {
	this.pasteButton = this.newDiv(this.folderControls);
	this.pasteButton.classList.add("browseFSbutton");
	this.pasteButton.classList.add("noselect");
	this.pasteButton.innerHTML = "Paste";
};

BrowseFS.prototype.newDiv = function(appendTo) {
	var el = document.createElement("div");
	appendTo.appendChild(el);
	return el;
};

BrowseFS.prototype.select = function(name) {
	// TODO: show options
	this.selected.push(name);

	this.showTopControls();
};

BrowseFS.prototype.removeSelection = function(name) {
	// TODO: remove options if selection is now empty
	this.selected.splice(this.selected.indexOf(div.value));

	this.hideTopControls();
};

BrowseFS.prototype.showTopControls = function() {
	if (this.selected.length == 0) {
		return 1;
	}
	// Controls to do:
	// - Move
	// - Remove
	// - Copy
	// - Share
	// - Open (sub: compress)
	// - Properties
};

BrowseFS.prototype.hideTopControls = function() {
	if (this.selected.length != 0) {
		return 1;
	}
	this.fileControls.innerHTML = "";
};

BrowseFS.prototype.abscd = function(absolutePath) {
	this.currentPath = absolutePath;
	this.displayFolder(this.currentPath);

	// Selections are in a current folder only, so since we are changing directory we want to empty the selection
	this.selected = [];
};

BrowseFS.prototype.relcd = function(relativePath) {
	// TODO: Resolve relative paths
	if (this.currentPath == "") { // We're at the root
		this.currentPath = relativePath;
	}
	else {
		this.currentPath += "/" + relativePath;
	}
	this.displayFolder(this.currentPath);

	// Selections are in a current folder only, so since we are changing directory we want to empty the selection
	this.selected = [];
};

BrowseFS.prototype.displayFolder = function(path) {
	var data = this.GET(this.server + "getDirectory/" + encodeURIComponent(path));
	data = this.decode(data);

	data.dirs.sort(this.itemSort);
	data.files.sort(this.itemSort);

	// Create the path trail on top of the page
	this.breadcrumbsElement.innerHTML = "";
	var path = ("/" + this.currentPath).split('/');
	var fullpath = "";
	var first = true;
	for (var i in path) {
		if (!first) {
			fullpath += "/" + path[i];
			var separator = this.newDiv(this.breadcrumbsElement);
			separator.innerHTML = "&gt;";
			separator.style.marginLeft = "8px";
			separator.style.marginRight = "8px";
			separator.style.display = "inline";
		}
		else {
			path[i] = " / ";
			first = false;
		}

		var btn = this.newDiv(this.breadcrumbsElement);
		btn.fullpath = fullpath.substring(1); // Ignore the initial slash

		btn.textContent = path[i];
		btn.style.display = "inline";
		btn.style.padding = "6px";
		btn.style.margin = "2px";

		btn.addEventListener('click', function(ev) {
			browseFS.abscd(ev.target.fullpath);
		});

		btn.addEventListener('mouseover', function(ev) {
			ev.target.style.background = "#444";
		});

		btn.addEventListener('mouseout', function(ev) {
			ev.target.style.background = "#000";
		});
	}
	
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

BrowseFS.prototype.escapeHTML = function(str) {
	var pre = document.createElement('pre');
	var text = document.createTextNode(string);
	pre.appendChild(text);
	return pre.innerHTML;
}

BrowseFS.prototype.itemSort = function(a, b) {
	if (!a.favorite && b.favorite) {
		return 1;
	}
	if (a.favorite && !b.favorite) {
		return -1;
	}
	if (a.name.charAt(0) == "." && b.name.charAt(0) != ".") {
		return 1;
	}
	if (a.name.charAt(0) != "." && b.name.charAt(0) == ".") {
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

BrowseFS.prototype.newTile = function(item, isDir) {
	var fav = item.favorite;
	var name = item.name;

	var div = this.newDiv(this.contentElement);
	div.classList.add('noselect');
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
			browseFS.select(div.value);
		}
		else {
			div.style.background = "#0f0f00";
			div.style.boxShadow = "0px 1px 1px 0px rgba(0, 0, 0, 0.2)";
			browseFS.removeSelection(div.value);
		}
	});

	div.addEventListener('dblclick', function(ev) {
		if (div.isDir) {
			browseFS.relcd(div.value);
		}
		else {
			browseFS.open(div.value);
		}
        document.getSelection().removeAllRanges();
	});

	icon.addEventListener('click', function(ev) {
		browseFS.toggleFavorite(name);
		browseFS.cancelBubbling(ev);
	});
};

BrowseFS.prototype.toggleFavorite = function(name) {
	this.GET(this.server + "toggleFavorite/" + this.currentPath + "/" + name);
	this.reloadFolder();
};

// Opens a file on the system (calling to the API)
BrowseFS.prototype.open = function(fname) {
	this.GET(this.server + "open/3/" + this.currentPath + "/" + fname);
};

BrowseFS.prototype.reloadFolder = function() {
	this.displayFolder(this.currentPath);
};

BrowseFS.prototype.cancelBubbling = function(ev) {
	var evt = ev ? ev : window.event;
	if (evt.stopPropagation) evt.stopPropagation();
	if (evt.cancelBubble != null) evt.cancelBubble = true;
};

BrowseFS.prototype.GET = function(uri) {
	var req = new XMLHttpRequest();
	req.open("GET", uri, false);
	req.send(null);
	return req.responseText;
};

BrowseFS.prototype.decode = function(rawData) {
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

