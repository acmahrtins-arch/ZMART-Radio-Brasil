import os
from flask import Flask, render_template, send_from_directory, make_response

app = Flask(__name__)


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
