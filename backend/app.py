import os
from flask import Flask, request
from flask_cors import CORS
from routes import products_bp


app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET",
    "happy-with-healthy-change-this-secret"
)
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": [
                "https://happy-with-healthy.onrender.com",
            ],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
        }
    },
)
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        return "", 200

app.register_blueprint(products_bp)


@app.route("/")
def home():
    return {
        "message": "Happy With Healthy API is running!",
        "status": "success"
    }


if __name__ == "__main__":
    app.run(debug=True, port=5000)