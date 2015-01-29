# BrowseFS

Browse the FileSystem in your browser

## Why?

Because I thought Google Drive's interface was interesting. Thought I'd make
something similar and see how it worked out.

This is not a very serious project, but you are welcome to fork and do with it
whatever you want. I'd be happy to receive pull requests!

## Supported systems

I use this on Linux. I could see how it works out-of-the-box on OS X (or any
unix system) but Windows will need some modifications. Sorry (but not really).

You'll also need a modern browser like Firefox or Chromium.

## Usage

You need a recent version of Flask. The one currently in the Ubuntu
repositories is too old, so I used:

`sudo pip install https://github.com/mitsuhiko/flask/tarball/master`

Run `flask --app=BrowseFS initdb` to initialize the database, modify
`templates/front.html` to include your home path of choice, and finally run the
server with `./BrowseFS.py`. You can now go to <http://[::1]/front.html>

