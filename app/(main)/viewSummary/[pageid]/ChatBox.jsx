import React from "react";

// Renamed prop from 'Chat' to 'Chats' for clarity, matching the usage in viewSummary
function ChatBox({ Chats }) {
  // Check if Chats is an array and contains data
  if (!Chats || !Array.isArray(Chats) || Chats.length === 0) {
    return (
      <div className="p-4 bg-white border rounded-xl shadow-lg h-full">
        <h3 className="font-bold text-lg mb-2 text-center text-gray-700">
          Conversation Transcript
        </h3>
        <p className="text-gray-500 text-center mt-10">
          No conversation history available.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white border rounded-xl shadow-lg h-full max-h-[65vh] overflow-y-auto">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-gray-200 rounded-2xl mb-2">
        <h3 className="font-bold text-lg mb-2 text-center text-gray-700">
          Conversation Transcript
        </h3>
      </div>

      <div className="space-y-4">
        {Chats.map((message, index) => (
          <div
            key={index}
            // Align the message bubble based on the role
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-xl shadow-md ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none" // Blue for user, rounded corners on top/left/bottom-left
                  : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-200" // Light gray for assistant
              }`}
            >
              {/* Optional: Display role title for clarity */}
              <p
                className={`text-xs font-semibold mb-1 ${message.role === "user" ? "text-blue-200" : "text-gray-500"}`}
              >
                {message.role === "user" ? "You" : "Mathhew (AI)"}
              </p>

              {/* Display the message text */}
              <p className="whitespace-pre-wrap">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChatBox;
