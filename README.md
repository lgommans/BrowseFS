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

The only package I think you need is **python-flask** (apt-get it). Then run
`flask --app=BrowseFS initdb` to initialize the database, and finally run
the server with `./main.py`. You can now go to <http://[::1]/front.html>

