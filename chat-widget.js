/* chat-widget.js */
(function() {
    // Server connection check function
    async function checkServerConnection() {
        try {
            const endpoint = getApiEndpoint();
            console.log("🔄 Checking server connection at:", endpoint);
            
            const response = await fetch(`${endpoint}/history`, {
                method: 'GET',
                headers: {
                    'X-Origin-Domain': window.location.hostname
                },
                credentials: 'omit',
                mode: 'cors'
            });
            
            if (!response.ok) {
                console.error('❌ Server connection check failed:', response.status);
                return false;
            }
            
            console.log('✅ Server connection successful');
            return true;
        } catch (error) {
            console.error('❌ Server connection check failed:', error);
            return false;
        }
    }

    // Dynamically determine the endpoint URL
    function getApiEndpoint() {
        const scripts = document.getElementsByTagName('script');
        const currentScript = scripts[scripts.length - 1];
        
        // Check if a data-api-url attribute is provided (highest priority)
        const dataApiUrl = currentScript.getAttribute('data-api-url');
        if (dataApiUrl) {
            console.log("🔗 Using data-api-url:", dataApiUrl);
            return dataApiUrl;
        }
        
        // For GitHub Codespaces
        if (window.location.hostname.endsWith('.app.github.dev')) {
            const url = `https://${window.location.hostname}/chat`;
            console.log("🔗 Using GitHub Codespace URL:", url);
            return url;
        }
        
        // For local development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log("🔗 Using localhost URL");
            return 'http://localhost:8000/chat';
        }
        
        // For production (using GitHub Codespace URL)
        const defaultUrl = 'https://curly-adventure-q7447rx9g94qr-8000.app.github.dev/chat';
        console.log("🔗 Using default URL:", defaultUrl);
        return defaultUrl;
    }

    // Initialize the chat API endpoint
    const chatApiEndpoint = getApiEndpoint();
    console.log("🚀 Initialized chat API endpoint:", chatApiEndpoint);

    // Modified sendMessage function with async/await
    async function sendMessage(chatMessages, inputField) {
        let userMessage = inputField.value;
        if (!userMessage.trim()) return;
        
        chatMessages.innerHTML += `<div style="text-align: right; color: blue;">${userMessage}</div>`;
        inputField.value = "";
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        const currentDomain = window.location.hostname;
        console.log("🌐 Sending message from domain:", currentDomain);
        
        const loadingId = `loading-${Date.now()}`;
        chatMessages.innerHTML += `<div id="${loadingId}" style="text-align: left; color: gray;">Thinking...</div>`;
        
        try {
            console.log("📨 Making request to:", chatApiEndpoint);
            const response = await fetch(chatApiEndpoint, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Origin-Domain": currentDomain 
                },
                body: JSON.stringify({ message: userMessage }),
                credentials: 'omit',
                mode: 'cors'
            });

            console.log("📥 Response status:", response.status);
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            console.log("📦 Response data:", data);

            // Remove loading indicator
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            // Display response
            chatMessages.innerHTML += `<div style="text-align: left; color: black;">${data.response}</div>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (error) {
            console.error("❌ Error in sendMessage:", error);
            
            // Remove loading indicator
            const loadingElement = document.getElementById(loadingId);
            if (loadingElement) {
                loadingElement.remove();
            }
            
            chatMessages.innerHTML += `<div style="text-align: left; color: red;">Connection error. Please try again later. (${error.message})</div>`;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    function openChat() {
        let chatWindow = document.createElement("div");
        chatWindow.style.position = "fixed";
        chatWindow.style.bottom = "80px";
        chatWindow.style.right = "20px";
        chatWindow.style.width = "320px";
        chatWindow.style.maxHeight = "400px";
        chatWindow.style.backgroundColor = "white";
        chatWindow.style.borderRadius = "10px";
        chatWindow.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        chatWindow.style.overflow = "hidden";
        chatWindow.style.display = "flex";
        chatWindow.style.flexDirection = "column";
        chatWindow.style.zIndex = "10000"; // Ensure chat window is on top

        let chatHeader = document.createElement("div");
        chatHeader.innerHTML = "Chat with us ✖";
        chatHeader.style.backgroundColor = "#007bff";
        chatHeader.style.color = "white";
        chatHeader.style.padding = "10px";
        chatHeader.style.textAlign = "center";
        chatHeader.style.fontWeight = "bold";
        chatHeader.style.cursor = "pointer";
        chatHeader.onclick = function() {
            document.body.removeChild(chatWindow);
        };
        chatWindow.appendChild(chatHeader);

        let chatMessages = document.createElement("div");
        chatMessages.id = "chatMessages";
        chatMessages.style.flex = "1";
        chatMessages.style.height = "250px";
        chatMessages.style.overflowY = "auto";
        chatMessages.style.padding = "10px";
        chatMessages.style.borderBottom = "1px solid #ddd";
        chatMessages.innerHTML = "<div>How can we help you?</div>";
        chatWindow.appendChild(chatMessages);

        let chatInput = document.createElement("div");
        chatInput.style.display = "flex";
        chatInput.style.padding = "10px";
        chatInput.style.backgroundColor = "#f1f1f1";

        let inputField = document.createElement("input");
        inputField.type = "text";
        inputField.placeholder = "Type your message...";
        inputField.style.flex = "1";
        inputField.style.padding = "5px";
        inputField.style.border = "1px solid #ccc";
        inputField.style.borderRadius = "5px";
        chatInput.appendChild(inputField);

        let sendButton = document.createElement("button");
        sendButton.innerHTML = "Send";
        sendButton.style.backgroundColor = "#007bff";
        sendButton.style.color = "white";
        sendButton.style.border = "none";
        sendButton.style.padding = "5px 10px";
        sendButton.style.marginLeft = "5px";
        sendButton.style.borderRadius = "5px";
        sendButton.style.cursor = "pointer";
        
        // Use bound function for consistent context
        const boundSendMessage = () => sendMessage(chatMessages, inputField);
        sendButton.onclick = boundSendMessage;
        
        // Handle Enter key
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                boundSendMessage();
            }
        });
        
        chatInput.appendChild(sendButton);
        chatWindow.appendChild(chatInput);
        document.body.appendChild(chatWindow);
    }

    // Initialize chat with connection check
    async function initializeChat() {
        console.log("🔄 Initializing chat widget...");
        const isServerConnected = await checkServerConnection();
        
        if (!isServerConnected) {
            console.error("❌ Failed to initialize chat - server not reachable");
            return;
        }

        console.log("✅ Server connection verified, creating chat icon");
        let chatIcon = document.createElement("div");
        chatIcon.innerHTML = "💬";
        chatIcon.style.position = "fixed";
        chatIcon.style.bottom = "20px";
        chatIcon.style.right = "20px";
        chatIcon.style.width = "60px";
        chatIcon.style.height = "60px";
        chatIcon.style.backgroundColor = "#007bff";
        chatIcon.style.color = "white";
        chatIcon.style.borderRadius = "50%";
        chatIcon.style.display = "flex";
        chatIcon.style.alignItems = "center";
        chatIcon.style.justifyContent = "center";
        chatIcon.style.cursor = "pointer";
        chatIcon.style.fontSize = "24px";
        chatIcon.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        chatIcon.style.zIndex = "10000"; // Ensure chat icon is on top
        chatIcon.onclick = openChat;
        document.body.appendChild(chatIcon);
        console.log("✅ Chat widget initialized successfully");
    }

    // Start initialization
    initializeChat().catch(error => {
        console.error("❌ Failed to initialize chat widget:", error);
    });
})();
