#!/usr/bin/env python

import os
from sqlite3 import dbapi2 as sqlite3
from flask import Flask, request, render_template, g, Response

# Flask application name
app = Flask("BrowseFS")

# Load default config and override config from an environment variable
app.config.update(dict(
    DB=os.path.expanduser('~/.browseFS.db'),
    PORT=4993
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)


### Globals

favorites = []



### Commands


@app.route('/getDirectory/')
@app.route('/getDirectory/<path:directory>')
def getDirectory(directory = ""):
    get_db() # To get favorites (TODO: Find a better way to do this)
    #directory = "/" + directory[1:] # Ignore the preamable ("P") in the requested directory
    directory = "/" + directory
    contents = ""
    for item in os.listdir(directory):
        length = len(item) + 1

        if os.path.join(directory, item)[1:] in favorites:
            prefix = "F"
        else:
            prefix = "X"

        if os.path.isdir(os.path.join(directory, item)):
            length += 1
            prefix += "/"

        contents += str(length) + "," + prefix + item

    return contents


@app.route("/toggleFavorite/<path:directory>")
def toggleFavorite(directory):
    db = get_db()
    if directory in favorites:
        db.execute('delete from favorites where path = "' + directory + '"')
        favorites.remove(directory)
    else:
        db.execute('insert into favorites values("' + directory + '")')
        favorites.append(directory)

    db.commit()

    return "1"


@app.route("/open/<int:mode>/<path:file>")
def openFile(mode, file):
    file = "/" + file
    if mode == 1:
        os.system('xdg-open ' + shellescape('/' + file))
        return "1"
    elif mode == 2:
        os.system(shellescape('/' + file))
        return "2"
    elif mode == 3:
        executable = os.access(file, os.X_OK)
        if executable:
            return openFile(2, file)
        else:
            return openFile(1, file)
    else:
        return "Invalid mode"



### Static files


@app.route('/')
@app.route('/front.html')
def getFront():
    return render_template('front.html')


@app.route('/BrowseFS.class.js')
def getJs():
    return render_template('BrowseFS.class.js')


@app.route('/BrowseFS.css')
def getCss():
    return Response(render_template('BrowseFS.css'), mimetype='text/css')



### Helper functions


def shellescape(s):
    return "'" + s.replace("'", "'\\''") + "'"


def uniqueList(seq):
    seen = set()
    seen_add = seen.add
    return [ x for x in seq if not (x in seen or seen_add(x))]


def connect_db():
    """Connects to the specific database."""
    rv = sqlite3.connect(app.config['DB'])
    rv.row_factory = sqlite3.Row
    return rv


@app.cli.command('initdb')
def initdb_command():
    """Creates the database tables."""
    init_db()
    print('Initialized the database.')


def init_db():
    """Initializes the database."""
    db = connect_db()
    with app.open_resource('db-schema.sql', mode='r') as f:
        db.cursor().executescript(f.read())
    db.commit()


def get_db():
    """Opens a new database connection if there is none yet for the
    current application context.
    """
    global favorites
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()

        db = get_db()
        cur = db.execute('select path from favorites')
        fav = cur.fetchall()
        favorites = []
        for item in fav:
            favorites.append(item[0])

    return g.sqlite_db


@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()



### Main


if __name__ == '__main__':
    app.run(host='::1', port=app.config['PORT'], debug=True)

