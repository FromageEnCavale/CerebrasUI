import Cerebras from 'https://cdn.jsdelivr.net/npm/@cerebras/cerebras_cloud_sdk/+esm';

const messagesDiv = document.getElementById('messages');

const userInput = document.getElementById('userInput');

const apiKeyInput = document.getElementById('apiKey');

const statusDiv = document.getElementById('status');

let cerebrasClient = null;

let conversationHistory = [];

function extractCodeBlocks(text) {

    const codeBlocks = [];

    const newText = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {

        codeBlocks.push({ language: lang, code: code });

        return `{{CODEBLOCK_${codeBlocks.length - 1}}}`;

    });

    return { newText, codeBlocks };

}

function escapeHtml(text) {

    const map = {

        '&': '&amp;',

        '<': '&lt;',

        '>': '&gt;',

        '"': '&quot;',

        "'": '&#039;'

    };

    return text.replace(/[&<>"']/g, m => map[m]);

}

function parseMarkdown(text) {

    const { newText, codeBlocks } = extractCodeBlocks(text);

    let processedText = escapeHtml(newText);

    processedText = processedText.replace(/`([^`]+)`/g, (match, code) => {

        return `<code>${code}</code>`;

    });

    processedText = processedText.replace(/^###### (.*$)/gm, '<h6>$1</h6>');

    processedText = processedText.replace(/^##### (.*$)/gm, '<h5>$1</h5>');

    processedText = processedText.replace(/^#### (.*$)/gm, '<h4>$1</h4>');

    processedText = processedText.replace(/^### (.*$)/gm, '<h3>$1</h3>');

    processedText = processedText.replace(/^## (.*$)/gm, '<h2>$1</h2>');

    processedText = processedText.replace(/^# (.*$)/gm, '<h1>$1</h1>');

    processedText = processedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    processedText = processedText.replace(/__(.*?)__/g, '<strong>$1</strong>');

    processedText = processedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

    processedText = processedText.replace(/_(.*?)_/g, '<em>$1</em>');

    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    processedText = processedText.split(/\n\n/).map(para => {

        if (para.match(/^\s*<(h[1-6]|pre|ul|ol|blockquote|p|div)/)) {

            return para;

        }

        return `<p>${para.trim()}</p>`;

    }).join('\n\n');

    processedText = processedText.replace(/{{CODEBLOCK_(\d+)}}/g, (match, index) => {

        const block = codeBlocks[index];

        const escapedCode = escapeHtml(block.code);

        if (block.language) {

            return `<div class="code-block">
                        
                        <div class="code-lang">${block.language}</div>
                        
                        <pre>${escapedCode}</pre>
                    
                    </div>`;

        } else {

            return `<pre>${escapedCode}</pre>`;

        }

    });

    return processedText;

}

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

            responseElement.innerHTML = parseMarkdown(responseText);  // Utilisation du parseur Markdown ici

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