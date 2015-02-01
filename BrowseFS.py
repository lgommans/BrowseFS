#!/usr/bin/env python

import os
import json
from sqlite3 import dbapi2 as sqlite3
from flask import Flask, request, send_from_directory, g, redirect

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
favorites_loaded = False



### Commands


@app.route('/getDirectory/')
@app.route('/getDirectory/<path:directory>')
def getDirectory(directory = ""):
    load_favorites() # Make sure favorites are loaded
    directory = "/" + directory
    data = {'dirs': [], 'files': []}  
    for item in os.listdir(directory):
        isFav = False
        if os.path.join(directory, item)[1:] in favorites:
            isFav = True

        if os.path.isdir(os.path.join(directory, item)):
            data['dirs'].append({'name': item, 'favorite': isFav})
        else:
            data['files'].append({'name': item, 'favorite': isFav})

    return json.dumps(data)


@app.route("/toggleFavorite/<path:directory>")
def toggleFavorite(directory):
    load_favorites() # Make sure favorites are loaded
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
def getIndex():
    return getStaticFile('front.html')


@app.route('/static/<path:path>')
def getStaticFile(path):
    return send_from_directory('static/', path)



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
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()

    return g.sqlite_db


def load_favorites():
    global favorites, favorites_loaded
    if not favorites_loaded:
        db = get_db()
        cur = db.execute('select path from favorites')
        fav = cur.fetchall()
        favorites = []
        for item in fav:
            favorites.append(item[0])

        favorites_loaded = True


@app.teardown_appcontext
def close_db(error):
    """Closes the database again at the end of the request."""
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()



### Main


if __name__ == '__main__':
    app.run(host='::1', port=app.config['PORT'], debug=True)

