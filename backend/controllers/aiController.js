/**
 * AI Controller
 * Interfaces with OpenAI for chatbot, summarizer, code gen, doubt solver
 */

const OpenAI = require('openai');

const getClient = () => {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    return null;
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// Generic helper to call OpenAI with fallback mock
const callAI = async (systemPrompt, userMessage) => {
  const client = getClient();
  if (!client) {
    // Mock response when no API key is configured
    return `[Demo Mode] AI response to: "${userMessage.slice(0, 80)}..." — Add your OpenAI API key in backend/.env to enable real AI responses.`;
  }

  const response = await client.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 800,
    temperature: 0.7,
  });
  return response.choices[0].message.content;
};

// ─── @route POST /api/ai/chat ─────────────────────────────────────────────────
const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

    const client = getClient();
    let reply;

    if (!client) {
      reply = `[Demo Mode] You said: "${message}". Add your OpenAI API key in .env to enable the real chatbot.`;
    } else {
      const messages = [
        { role: 'system', content: 'You are CampusBot, a helpful AI assistant for college students. Help with academics, career guidance, and general queries. Be concise and friendly.' },
        ...history.slice(-6), // Keep last 3 exchanges for context
        { role: 'user', content: message },
      ];
      const response = await client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 600,
      });
      reply = response.choices[0].message.content;
    }

    res.json({ success: true, data: { reply } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/ai/summarize ───────────────────────────────────────────
const summarizeNotes = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ success: false, message: 'Text is required.' });

    const summary = await callAI(
      'You are an expert academic summarizer. Create a clear, structured summary with key points, definitions, and important concepts. Use bullet points and headings.',
      `Please summarize the following notes:\n\n${text}`
    );

    res.json({ success: true, data: { summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/ai/generate-code ───────────────────────────────────────
const generateCode = async (req, res) => {
  try {
    const { prompt, language = 'python' } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required.' });

    const code = await callAI(
      `You are an expert ${language} programmer and computer science tutor. Generate clean, well-commented code with explanations. Always include example usage.`,
      `Generate ${language} code for: ${prompt}`
    );

    res.json({ success: true, data: { code } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route POST /api/ai/solve-doubt ─────────────────────────────────────────
const solveDoubt = async (req, res) => {
  try {
    const { doubt, subject = 'general' } = req.body;
    if (!doubt) return res.status(400).json({ success: false, message: 'Doubt is required.' });

    const answer = await callAI(
      `You are an expert ${subject} teacher for college students. Explain concepts step by step in a simple, clear manner. Use examples and analogies where helpful.`,
      `Please explain: ${doubt}`
    );

    res.json({ success: true, data: { answer } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { chatWithAI, summarizeNotes, generateCode, solveDoubt };
