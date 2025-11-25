import os
from livekit import api
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from flask_cors import CORS
from livekit.api import LiveKitAPI, ListRoomsRequest
import uuid
import asyncio

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

async def generate_room_name():
    name = "room-" + str(uuid.uuid4())[:8]
    rooms = await get_rooms()
    while name in rooms:
        name = "room-" + str(uuid.uuid4())[:8]
    return name

async def get_rooms():
    api_client = LiveKitAPI()
    rooms = await api_client.room.list_rooms(ListRoomsRequest())
    await api_client.aclose()
    return [room.name for room in rooms.rooms]

@app.route("/getToken", methods=["GET"])
def get_token():
    """Get LiveKit access token for a user"""
    try:
        name = request.args.get("name", "user")
        room = request.args.get("room", None)
        
        # Generate room name if not provided
        if not room:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                room = loop.run_until_complete(generate_room_name())
            finally:
                loop.close()
        
        # Create access token
        token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")) \
            .with_identity(name)\
            .with_name(name)\
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room,
                can_publish=True,
                can_subscribe=True,
            ))
        
        return jsonify({
            "token": token.to_jwt(),
            "room": room
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/getLiveKitUrl", methods=["GET"])
def get_livekit_url():
    """Get LiveKit WebSocket URL"""
    url = os.getenv("LIVEKIT_URL", "wss://your-livekit-server.com")
    if url == "wss://your-livekit-server.com":
        return jsonify({
            "url": url,
            "error": "LIVEKIT_URL not configured. Please set LIVEKIT_URL in your .env file."
        }), 400
    return jsonify({"url": url})

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "livekit_url_configured": os.getenv("LIVEKIT_URL") is not None and os.getenv("LIVEKIT_URL") != "wss://your-livekit-server.com",
        "api_key_configured": os.getenv("LIVEKIT_API_KEY") is not None,
        "api_secret_configured": os.getenv("LIVEKIT_API_SECRET") is not None,
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)