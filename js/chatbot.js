/* ==========================================================================
   ANGIOCARE - CHATBOT MODULE
   ========================================================================== */

const chatbotModule = (() => {
    let recognition = null;
    let isRecording = false;

    // Multilingual Chat Intents & Responses Database
    const botIntents = {
        'en-US': [
            {
                keywords: ['disease', 'blight', 'blast', 'spots', 'yellow'],
                response: "To diagnose leaf spots or blights, please navigate to the 'AI Disease Detection' section on the sidebar and take or upload a leaf photo. Our CNN model will identify the disease and specify remedies."
            },
            {
                keywords: ['fertilizer', 'urea', 'feed', 'npk', 'compost'],
                response: "For nitrogen feeds, we recommend using organic vermicompost or neem cake. If using NPK, apply a balanced 19-19-19 ratio early in vegetative growth, reducing chemical feeds closer to harvest."
            },
            {
                keywords: ['water', 'irrigation', 'dry', 'rain'],
                response: "Irrigation depends on the crop. Tomato requires 1-2 inches of water per week at the roots. Rice fields need continuous shallow flooding (2-5cm) until grain ripening. Drip irrigation saves up to 40% water."
            },
            {
                keywords: ['weather', 'forecast', 'temperature'],
                response: "You can view real-time weather analytics, humidity indexes, and disease outbreak warnings under the 'Weather & Forecast' page."
            },
            {
                keywords: ['hello', 'hi', 'greetings', 'namaste'],
                response: "Hello! I am AngioBot. How can I assist you with your farming, crop protection, or fertilizers today?"
            }
        ],
        'hi-IN': [
            {
                keywords: ['बीमारी', 'धब्बे', 'ब्लाइट', 'पीला', 'रोग'],
                response: "पत्तियों के धब्बों या बीमारियों की पहचान के लिए, कृपया साइडबार पर 'AI Disease Detection' अनुभाग पर जाएं और एक फोटो अपलोड करें। हमारा AI मॉडल तुरंत समाधान बताएगा।"
            },
            {
                keywords: ['खाद', 'यूरिया', 'एनपीके', 'कंपोस्ट', 'उर्वरक'],
                response: "नाइट्रोजन के लिए, हम जैविक केंचुआ खाद (वर्मीकंपोस्ट) या नीम की खली के उपयोग की सलाह देते हैं। रासायनिक खादों का उपयोग कम से कम करें।"
            },
            {
                keywords: ['पानी', 'सिंचाई', 'सूखा', 'बारिश'],
                response: "सिंचाई फसल पर निर्भर करती है। टमाटर को प्रति सप्ताह 1-2 इंच पानी की आवश्यकता होती है। धान के खेतों में हल्की जलभराव (2-5 सेमी) आवश्यक है।"
            },
            {
                keywords: ['नमस्ते', 'हैलो', 'राम राम'],
                response: "नमस्ते! मैं एंजियोबॉट (AngioBot) हूँ। आज मैं आपकी खेती, फसल सुरक्षा या खाद के बारे में क्या मदद कर सकता हूँ?"
            }
        ],
        'te-IN': [
            {
                keywords: ['తెగులు', 'వ్యాధి', 'ఆకు', 'పసుపు'],
                response: "ఆకు తెగుళ్లను గుర్తించడానికి, దయచేసి సైడ్‌బార్‌లో 'AI Disease Detection' విభాగానికి వెళ్లి ఫోటోను అప్‌లోడ్ చేయండి. మా AI తగిన పరిష్కారాలను చూపిస్తుంది."
            },
            {
                keywords: ['హలో', 'నమస్కారం'],
                response: "నమస్కారం! నేను యాంజియోబాట్ (AngioBot). ఈ రోజు మీ వ్యవసాయం లేదా ఎరువుల గురించి నేను ఏ విధంగా సహాయపడగలను?"
            }
        ],
        'ta-IN': [
            {
                keywords: ['நோய்', 'இலை', 'மஞ்சள்'],
                response: "இலை நோய்களைக் கண்டறிய, தயவுசெய்து பக்கவாட்டுப் பட்டியில் உள்ள 'AI Disease Detection' பகுதிக்குச் சென்று புகைப்படத்தைப் பதிவேற்றவும். எங்கள் AI சரியான தீர்வை வழங்கும்."
            },
            {
                keywords: ['வணக்கம்', 'ஹலோ'],
                response: "வணக்கம்! நான் ஆன்ஜியோபாட் (AngioBot). இன்று உங்கள் விவசாயம் அல்லது உரங்களைப் பற்றி நான் எவ்வாறு உதவ முடியும்?"
            }
        ]
    };

    // Chat Rooms simulation
    let chatRooms = [
        { id: 'room-1', title: 'Crop Protection Help' },
        { id: 'room-2', title: 'Fertilizer Inquiries' }
    ];
    let activeRoomId = 'room-1';

    // Initialize voice and clicks
    function init() {
        const sendBtn = document.getElementById('chat-send-btn');
        const input = document.getElementById('chat-input');
        const micBtn = document.getElementById('chat-mic-btn');
        const keyInput = document.getElementById('chatbot-api-key');

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Load saved Gemini API Key
        if (keyInput) {
            const savedKey = localStorage.getItem('angiocare_gemini_key') || '';
            keyInput.value = savedKey;
            keyInput.addEventListener('input', () => {
                localStorage.setItem('angiocare_gemini_key', keyInput.value.trim());
            });
        }

        // Initialize Web Speech API Recognition
        initSpeechRecognition();

        if (micBtn) {
            micBtn.addEventListener('click', toggleVoiceInput);
        }

        renderChatRooms();
    }

    // Set up Speech Recognition
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Browser does not support Web Speech Recognition API");
            return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            isRecording = true;
            document.getElementById('chat-mic-btn').classList.add('recording');
            app.showToast('Listening to your speech...', 'info');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('chat-input').value = transcript;
            app.showToast('Voice processed!', 'success');
            sendMessage();
        };

        recognition.onerror = (e) => {
            console.error("Speech Recognition Error: ", e);
            app.showToast('Speech not recognized', 'warning');
            stopRecording();
        };

        recognition.onend = () => {
            stopRecording();
        };
    }

    // Toggle Mic recording state
    function toggleVoiceInput() {
        if (!recognition) {
            app.showToast('Voice typing is not supported on this browser', 'warning');
            return;
        }

        if (isRecording) {
            recognition.stop();
        } else {
            const selectedLang = document.getElementById('chat-lang').value;
            recognition.lang = selectedLang;
            recognition.start();
        }
    }

    function stopRecording() {
        isRecording = false;
        const micBtn = document.getElementById('chat-mic-btn');
        if (micBtn) micBtn.classList.remove('recording');
    }

    // Send chat text message
    function sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;

        // Render user message bubble
        appendMessage('user', text);
        input.value = '';

        // Auto Scroll
        const chatBody = document.getElementById('chat-body');
        chatBody.scrollTop = chatBody.scrollHeight;

        const keyInput = document.getElementById('chatbot-api-key');
        const apiKey = keyInput ? keyInput.value.trim() : '';

        if (apiKey) {
            // Render thinking bubble
            const thinkingBubble = appendMessage('bot', 'AngioBot is thinking...');
            chatBody.scrollTop = chatBody.scrollHeight;

            // API endpoint query to Gemini 2.5 flash
            fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: text }]
                    }],
                    systemInstruction: {
                        parts: [{
                            text: "You are AngioBot, a professional AI agronomy assistant on the AngioCare crop platform. Give concise, highly structured, expert guidance on agricultural topics. Answer in the language of the query. Speak directly to the farmer."
                        }]
                    }
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                let botReply = '';
                try {
                    botReply = data.candidates[0].content.parts[0].text;
                } catch (e) {
                    botReply = "Sorry, I received an unexpected response format from the Gemini service.";
                }
                thinkingBubble.textContent = botReply;
                chatBody.scrollTop = chatBody.scrollHeight;
                speakOut(botReply);
            })
            .catch(err => {
                console.error("Gemini API connection error: ", err);
                thinkingBubble.textContent = `Error connecting to Gemini: ${err.message}. Please double-check your API Key and internet connection.`;
                chatBody.scrollTop = chatBody.scrollHeight;
            });
        } else {
            // Fallback to local rule-based response
            setTimeout(() => {
                const response = generateBotResponse(text);
                appendMessage('bot', response);
                chatBody.scrollTop = chatBody.scrollHeight;

                // Trigger text-to-speech audio feedback
                speakOut(response);
            }, 800);
        }
    }

    // Generate responsive bot content
    function generateBotResponse(userInput) {
        const lang = document.getElementById('chat-lang').value;
        const textLower = userInput.toLowerCase();
        
        const intents = botIntents[lang] || botIntents['en-US'];

        // Match keyword
        for (let intent of intents) {
            if (intent.keywords.some(keyword => textLower.includes(keyword))) {
                return intent.response;
            }
        }

        // Default fallbacks
        switch (lang) {
            case 'hi-IN':
                return "मुझे खेद है, मैं आपकी पूरी बात समझ नहीं पाया। कृपया खेती, खाद या फसल सुरक्षा के बारे में फिर से पूछें।";
            case 'te-IN':
                return "క్షమించండి, మీ ప్రశ్న నాకు పూర్తిగా అర్థం కాలేదు. దయచేసి వ్యవసాయానికి సంబంధించిన ప్రశ్నను మళ్ళీ అడగండి.";
            case 'ta-IN':
                return "மன்னிக்கவும், உங்கள் கேள்வி எனக்கு புரியவில்லை. விவசாயம் அல்லது உரங்கள் தொடர்பான கேள்விகளை மீண்டும் கேட்கவும்.";
            default:
                return "I couldn't quite find details on that specific topic. Try asking about 'crop disease diagnosis', 'organic fertilizer dosage', or 'irrigation water needs'.";
        }
    }

    // Append balloon bubble in chat UI
    function appendMessage(sender, messageText) {
        const chatBody = document.getElementById('chat-body');
        const msg = document.createElement('div');
        msg.className = `chat-message ${sender}`;
        msg.textContent = messageText;
        chatBody.appendChild(msg);
        return msg;
    }

    // Text to Speech Voice Audio Output
    function speakOut(text) {
        if ('speechSynthesis' in window) {
            // Cancel current speech queues
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            const selectedLang = document.getElementById('chat-lang').value;
            utterance.lang = selectedLang;

            // Select a matching Indian native speaker voice if present in system
            const voices = window.speechSynthesis.getVoices();
            const matchingVoice = voices.find(v => v.lang.startsWith(selectedLang.split('-')[0]));
            if (matchingVoice) {
                utterance.voice = matchingVoice;
            }

            window.speechSynthesis.speak(utterance);
        }
    }

    // Simulation rooms lists
    function renderChatRooms() {
        const container = document.getElementById('chat-rooms-container');
        container.innerHTML = '';

        chatRooms.forEach(room => {
            const item = document.createElement('div');
            item.className = `chat-room-item ${room.id === activeRoomId ? 'active' : ''}`;
            item.innerHTML = `
                <i data-lucide="message-square" style="width: 16px; height: 16px;"></i>
                <span style="font-size: 13px; font-weight: 500;">${room.title}</span>
            `;
            item.addEventListener('click', () => {
                activeRoomId = room.id;
                renderChatRooms();
                // Reset chat body
                document.getElementById('chat-body').innerHTML = `
                    <div class="chat-message bot">
                        Consultation room '${room.title}' loaded. Ask AngioBot details.
                    </div>
                `;
            });
            container.appendChild(item);
        });
        lucide.createIcons();
    }

    function startNewChat() {
        const title = prompt('Enter consultation topic:', 'New Crop Feed Inquiry');
        if (!title) return;

        const newId = 'room-' + Date.now();
        chatRooms.unshift({ id: newId, title });
        activeRoomId = newId;
        renderChatRooms();
        document.getElementById('chat-body').innerHTML = `
            <div class="chat-message bot">
                Consultation room '${title}' started. How can I help you?
            </div>
        `;
    }

    return {
        init,
        startNewChat
    };
})();
