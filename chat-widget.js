/* chat-widget.js */
(function() {
    // Dynamically determine the endpoint URL
function getApiEndpoint() {
    // Get the current script tag
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    
    // Check if a data-api-url attribute is provided
    const dataApiUrl = currentScript.getAttribute('data-api-url');
    if (dataApiUrl) {
        return dataApiUrl;
    }
    
    // For GitHub Codespace testing
    const codespaceUrl = 'https://curly-adventure-q7447rx9g94jc94qr-8000.app.github.dev/chat';
    
    // Default to the Codespace URL with port 8000
    return codespaceUrl;
}
    
    // Initialize the chat API endpoint
    const chatApiEndpoint = getApiEndpoint();
    console.log("Chat API endpoint:", chatApiEndpoint);
    
    // Create chat icon
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
    chatIcon.onclick = openChat;
    document.body.appendChild(chatIcon);

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
        sendButton.onclick = sendMessage;
        
        // Handle Enter key
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
        
        function sendMessage() {
            let userMessage = inputField.value;
            if (!userMessage.trim()) return;
            
            chatMessages.innerHTML += `<div style="text-align: right; color: blue;">${userMessage}</div>`;
            inputField.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            // Get the current domain for tenant identification
            const currentDomain = window.location.hostname;
            console.log("Current domain:", currentDomain);
            
            // Display loading indicator
            const loadingId = `loading-${Date.now()}`;
            chatMessages.innerHTML += `<div id="${loadingId}" style="text-align: left; color: gray;">Thinking...</div>`;
            
            fetch(chatApiEndpoint, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "X-Origin-Domain": currentDomain 
                },
                body: JSON.stringify({ message: userMessage }),
                credentials: 'include' // This ensures cookies are sent with the request
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Server responded with status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Remove loading indicator
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                // Display response
                chatMessages.innerHTML += `<div style="text-align: left; color: black;">${data.response}</div>`;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            })
            .catch(error => {
                console.error("Error:", error);
                
                // Remove loading indicator
                const loadingElement = document.getElementById(loadingId);
                if (loadingElement) {
                    loadingElement.remove();
                }
                
                chatMessages.innerHTML += `<div style="text-align: left; color: red;">Connection error. Please try again later. (${error.message})</div>`;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            });
        }
        
        chatInput.appendChild(sendButton);
        chatWindow.appendChild(chatInput);
        document.body.appendChild(chatWindow);
    }
})();
