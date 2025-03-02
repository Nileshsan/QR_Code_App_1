from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from config import Config

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Load configurations
app.config.from_object(Config)

# Initialize Database
db = SQLAlchemy(app)

# Database Model
class QRCode(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    entry_id = db.Column(db.String(255), unique=True, nullable=False)
    qr_code = db.Column(db.Text, nullable=False)

# Create Tables
with app.app_context():
    db.create_all()

# Serve Frontend
@app.route('/')
def index():
    return render_template('index.html')

# API: Fetch all QR code entries
@app.route('/get_entries', methods=['GET'])
def get_entries():
    try:
        entries = QRCode.query.all()
        return jsonify([{"entry_id": e.entry_id, "qr_code": e.qr_code} for e in entries])
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# API: Add a new QR code entry
@app.route('/add_entry', methods=['POST'])
def add_entry():
    try:
        data = request.json
        entry_id = data.get('entry_id')
        qr_code = data.get('qr_code')

        if not entry_id or not qr_code:
            return jsonify({"success": False, "message": "Invalid input"}), 400

        if QRCode.query.filter_by(entry_id=entry_id).first():
            return jsonify({"success": False, "message": "Entry ID already exists"}), 400

        new_entry = QRCode(entry_id=entry_id, qr_code=qr_code)
        db.session.add(new_entry)
        db.session.commit()

        return jsonify({"success": True, "message": "Entry added successfully"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# API: Delete an entry
@app.route('/delete_entry/<entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    try:
        entry = QRCode.query.filter_by(entry_id=entry_id).first()
        if not entry:
            return jsonify({"success": False, "message": "Entry not found"}), 404

        db.session.delete(entry)
        db.session.commit()
        return jsonify({"success": True, "message": "Entry deleted successfully"})

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
