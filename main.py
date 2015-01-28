#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash

# Flask application name
app = Flask("fs")

# Load default config and override config from an environment variable
app.config.update(dict(
    PORT=4993
))
app.config.from_envvar('FLASKR_SETTINGS', silent=True)


@app.route('/getDirectory/<path:directory>')
def getDirectory(directory):
    directory = "/" + directory
    contents = ""
    for item in os.listdir(directory):
        length = len(item)
        if os.path.isdir(os.path.join(directory, item)):
            length += 1
            contents += str(length) + ",/" + item
        else:
            contents += str(length) + "," + item
    
    return contents


@app.route('/Fs.class.js')
def getJs():
    return render_template('Fs.class.js')


@app.route('/front.html')
def getFront():
    return render_template('front.html')


if __name__ == '__main__':
    app.run(host='::1', port=app.config['PORT'], debug=True)

