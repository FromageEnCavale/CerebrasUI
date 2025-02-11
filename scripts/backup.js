/*
import Cerebras from 'https://cdn.jsdelivr.net/npm/@cerebras/cerebras_cloud_sdk/+esm';

const messagesDiv = document.getElementById('messages');

const userInput = document.getElementById('userInput');

const apiKeyInput = document.getElementById('apiKey');

const statusDiv = document.getElementById('status');

let cerebrasClient = null;

let conversationHistory = [];

function initClient(apiKey) {

    if (cerebrasClient && cerebrasClient.apiKey === apiKey) {

        return cerebrasClient;

    }

    cerebrasClient = new Cerebras({ apiKey });

    return cerebrasClient;

}

async function sendMessage() {

    const userMessage = userInput.value;

    const apiKey = apiKeyInput.value;

    if (!userMessage || !apiKey) return;

    conversationHistory.push({ role: 'user', content: userMessage });

    addMessage('user', userMessage);

    userInput.value = '';

    const responseElement = addMessage('assistant', '');

    try {

        statusDiv.textContent = 'Loading...';

        const client = initClient(apiKey);

        const stream = await client.chat.completions.create({

            messages: conversationHistory,

            model: 'llama-3.3-70b',

            stream: true,

        });

        let responseText = '';

        for await (const chunk of stream) {

            const content = chunk.choices[0]?.delta?.content || '';

            responseText += content;

            responseElement.textContent = responseText;

            messagesDiv.scrollTop = messagesDiv.scrollHeight;

        }

        conversationHistory.push({ role: 'assistant', content: responseText });

    } catch (error) {

        responseElement.textContent = 'Error: ' + error.message;

        console.error(error);

    } finally {

        statusDiv.textContent = '';

    }

}

function addMessage(role, content) {

    const messageDiv = document.createElement('div');

    messageDiv.className = `message ${role}`;

    messageDiv.textContent = content;

    messagesDiv.appendChild(messageDiv);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    return messageDiv;

}

userInput.addEventListener('keydown', (e) => {

    if (e.key === 'Enter') {

        e.preventDefault();

        sendMessage();

    }

});
*/