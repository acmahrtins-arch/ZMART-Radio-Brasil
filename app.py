import os
from flask import Flask, render_template, send_from_directory, make_response

app = Flask(__name__)


@app.after_request
def add_headers(response):
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://player.caster.fm https://www.caster.fm; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "media-src 'self' https: http:; "
        "frame-src https://zmartbr.ismyradio.com https://open.spotify.com https://player.caster.fm; "
        "connect-src 'self' https:; "
    )
    return response


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/sw.js")
def service_worker():
    response = make_response(
        send_from_directory(
            os.path.join(app.root_path, "static", "js"),
            "sw.js"
        )
    )
    response.headers["Content-Type"] = "application/javascript"
    response.headers["Service-Worker-Allowed"] = "/"
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    return response


@app.route("/manifest.json")
def manifest():
    response = make_response(
        send_from_directory(
            os.path.join(app.root_path, "static"),
            "manifest.json"
        )
    )
    response.headers["Content-Type"] = "application/manifest+json"
    return response


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
