import os
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import (
    AIMessage,
    HumanMessage,
    SystemMessage
)

# Initialize Flask
app = Flask(__name__) # Corrected: Used __name__
CORS(app)  # Allow cors

# Get API Key from Environment Variable
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("Please set the GOOGLE_API_KEY environment variable.")

# Initialize Gemini Pro Chat Model
with warnings.catch_warnings():
    warnings.simplefilter("ignore")
    chat_model = ChatGoogleGenerativeAI(model="gemini-pro", google_api_key=api_key, convert_system_message_to_human=True)

# Optional System Message
system_message = """You are a helpful and friendly chatbot."""

# Maintain chat history for each user
chat_histories = {}


@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_prompt = data.get('prompt')
    if not user_prompt:
        return jsonify({"error": "Prompt is missing."}), 400

    # Get or initialize chat history for user (e.g., based on a session or other unique identifier)
    # For this example will use simple user session ID which is user ip address for each session

    user_session_id = request.remote_addr
    if user_session_id not in chat_histories:
        messages = []  # Initialize an empty list for messages
        if system_message:
            messages.append(SystemMessage(content=system_message))
        chat_histories[user_session_id] = messages
    else:
        messages = chat_histories[user_session_id]

    messages.append(HumanMessage(content=user_prompt))

    try:
        ai_response = chat_model(messages)
        messages.append(AIMessage(content=ai_response.content))  # Append the AI message
        chat_histories[user_session_id] = messages  # Update message history
        return jsonify({"response": ai_response.content})
    except Exception as e:
        print(f"Error generating response: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=5000)