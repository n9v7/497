
import { messages } from './messages.js';

const loginSection = document.getElementById('login');
const mainSection = document.getElementById('main');
const tokenInput = document.getElementById('tokenInput');
const channelInput = document.getElementById('channelId');
const mentionInput = document.getElementById('mention');
const delayInput = document.getElementById('delay');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const logBox = document.getElementById('logBox');

let tokens = [];
let stop = false;

document.getElementById('loginBtn').onclick = () => {
  tokens = tokenInput.value.trim().split('\n').map(t => t.trim()).filter(t => t);
  if (tokens.length === 0) return alert('اكتب التوكنات');
  loginSection.classList.add('hidden');
  mainSection.classList.remove('hidden');
};

function shuffleArray(array) {
  let shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function sendMessage(token, channelId, content) {
  const url = `https://discord.com/api/v9/channels/${channelId}/messages`;
  const data = { content };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const txt = await res.text();
  if (res.ok) {
    logBox.innerText += `✅ ${token.slice(0, 10)}...: ${content}\n`;
  } else {
    logBox.innerText += `❌ ${token.slice(0, 10)}...: ${res.status} - ${txt}\n`;
  }
}

startBtn.onclick = async () => {
  const channelId = channelInput.value.trim();
  const mentions = mentionInput.value.split(',').map(id => `<@${id.trim()}>`).join(' ');
  const delay = parseFloat(delayInput.value) * 1000;

  if (!channelId) return alert("اكتب ID الروم");

  stop = false;
  const messageQueue = shuffleArray(messages);
  let index = 0;

  async function loopSend(token) {
    while (!stop && index < messageQueue.length) {
      const msg = `${messageQueue[index++]} ${mentions}`.trim();
      await sendMessage(token, channelId, msg);
      await new Promise(r => setTimeout(r, delay * tokens.length));
    }
  }

  tokens.forEach(token => loopSend(token));
  logBox.innerText += `🚀 بدأ الإرسال باستخدام ${tokens.length} توكن.
`;
};

stopBtn.onclick = () => {
  stop = true;
  logBox.innerText += `⛔ تم إيقاف الإرسال.
`;
};
