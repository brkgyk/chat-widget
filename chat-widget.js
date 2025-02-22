/* Unified Chat Widget - Works for Localhost & External Domains */
(function() {
    let sessionId = null;
    
    // Dynamically determine the API endpoint
    function getApiEndpoint() {
        return window.location.origin + "/chat";
    }

    const chatApiEndpoint = getApiEndpoint();
    console.log("🚀 Chat API endpoint:", chatApiEndpoint);
    
    // Create styles dynamically
    const style = document.createElement("style");
    style.innerHTML = `
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        .chat-icon { position: fixed; bottom: 20px; right: 20px; width: 60px; height: 60px; background-color: #007bff; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 24px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); z-index: 10000; }
        .chat-container { position: fixed; bottom: 80px; right: 20px; width: 320px; max-height: 400px; background-color: white; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); display: none; flex-direction: column; overflow: hidden; z-index: 10000; }
        .chat-header { background-color: #007bff; color: white; padding: 10px; text-align: center; font-weight: bold; cursor: pointer; }
        .chat-messages { flex: 1; height: 250px; overflow-y: auto; padding: 10px; border-bottom: 1px solid #ddd; }
        .chat-input { display: flex; padding: 10px; background-color: #f1f1f1; }
        .chat-input input { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px; }
        .chat-input button { background-color: #007bff; color: white; border: none; padding: 8px 12px; margin-left: 5px; border-radius: 5px; cursor: pointer; }
    `;
    document.head.appendChild(style);
    
    // Chat UI Elements
    let chatContainer, chatMessages, inputField;
    
    function createChatUI() {
        chatContainer = document.createElement("div");
        chatContainer.className = "chat-container";
        document.body.appendChild(chatContainer);
        
        let chatHeader = document.createElement("div");
        chatHeader.className = "chat-header";
        chatHeader.innerHTML = "Chat with us ✖";
        chatHeader.onclick = toggleChat;
        chatContainer.appendChild(chatHeader);
        
        chatMessages = document.createElement("div");
        chatMessages.className = "chat-messages";
        chatContainer.appendChild(chatMessages);
        
        let chatInput = document.createElement("div");
        chatInput.className = "chat-input";
        
        inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Type your message...";
        chatInput.appendChild(inputField);
        
        let sendButton = document.createElement("button");
        sendButton.innerHTML = "Send";
        sendButton.onclick = sendMessage;
        chatInput.appendChild(sendButton);
        
        chatContainer.appendChild(chatInput);
        
        inputField.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }
    
    function toggleChat() {
        chatContainer.style.display = chatContainer.style.display === "flex" ? "none" : "flex";
        if (chatContainer.style.display === "flex") {
            loadChatHistory();
        }
    }
    
    async function sendMessage() {
        let userMessage = inputField.value.trim();
        if (!userMessage) return;
        
        addMessage(userMessage, "user-message");
        inputField.value = "";
        
        try {
            const headers = {
                "Content-Type": "application/json",
                "X-Origin-Domain": window.location.hostname
            };
            
            if (sessionId) {
                headers["X-Session-ID"] = sessionId;
            }
            
            const response = await fetch(chatApiEndpoint, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ message: userMessage }),
                mode: 'cors'
            });
            
            const data = await response.json();
            
            if (data.session_id) {
                sessionId = data.session_id;
            }
            
            addMessage(data.response, "bot-message");
        } catch (error) {
            addMessage("Connection error. Please try again later.", "bot-message");
        }
    }
    
    async function loadChatHistory() {
        try {
            const response = await fetch(`${chatApiEndpoint}/history`, {
                headers: { "X-Origin-Domain": window.location.hostname },
                mode: 'cors'
            });
            
            const data = await response.json();
            chatMessages.innerHTML = "";
            
            if (data.history) {
                data.history.forEach(msg => {
                    addMessage(msg.content, msg.role === "user" ? "user-message" : "bot-message");
                });
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        }
    }
    
    function addMessage(message, className) {
        const msgElement = document.createElement("div");
        msgElement.className = className;
        msgElement.textContent = message;
        chatMessages.appendChild(msgElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    function createChatIcon() {
        let chatIcon = document.createElement("div");
        chatIcon.className = "chat-icon";
        chatIcon.innerHTML = "💬";
        chatIcon.onclick = toggleChat;
        document.body.appendChild(chatIcon);
    }
    
    createChatUI();
    createChatIcon();
})();
