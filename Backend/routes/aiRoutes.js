// routes/aiRoutes.js — Gemini-powered multilingual chatbot
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Info = require('../models/Info');

// @desc    AI Chat assistant (multilingual, context-aware)
// @route   POST /api/ai/chat
router.post('/chat', protect, async (req, res) => {
  const { message, language = 'en', history = [] } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({
      reply: 'AI assistant is currently unavailable. Please add GEMINI_API_KEY to your environment variables.',
      error: true,
    });
  }

  try {
    // Pull context data from the DB to ground the AI
    const [schemes, facilities] = await Promise.all([
      Info.find({ type: 'Scheme' }).limit(15).lean(),
      Info.find({ type: 'Facility' }).limit(15).lean(),
    ]);

    const schemesText = schemes.length
      ? schemes.map(s => `• ${s.title}: ${s.description}. Eligibility: ${s.eligibility || 'N/A'}. Benefits: ${s.benefits || 'N/A'}. ${s.website ? 'Website: ' + s.website : ''}`).join('\n')
      : 'No schemes currently in the database.';

    const facilitiesText = facilities.length
      ? facilities.map(f => `• ${f.title}: ${f.description}. Address: ${f.address || 'N/A'}. Contact: ${f.contactInfo || 'N/A'}. Hours: ${f.operatingHours || 'N/A'}.`).join('\n')
      : 'No facilities currently in the database.';

    const langInstructions = {
      en: 'Respond in clear, simple English.',
      hi: 'हमेशा हिंदी में जवाब दें।',
      mr: 'नेहमी मराठीत उत्तर द्या.',
      bn: 'সবসময় বাংলায় উত্তর দিন।',
    };
    const langInstruction = langInstructions[language] || langInstructions.en;

    const systemPrompt = `You are a helpful civic assistant for "FixItNow" — a government citizen grievance portal. ${langInstruction}

PLATFORM CONTEXT:
- Citizens report civic issues: Potholes, Garbage, Street Lights, Water Leakage, Electricity problems.
- Admins manage and resolve those issues.
- The portal also lists Government Schemes and local Facilities.

AVAILABLE GOVERNMENT SCHEMES:
${schemesText}

AVAILABLE LOCAL FACILITIES:
${facilitiesText}

YOUR ROLE:
1. Help citizens understand how to report civic issues on the platform.
2. Explain government schemes they may be eligible for based on their query.
3. Help locate local facilities like banks, Aadhaar centers, hospitals.
4. Answer general civic questions and guide on complaint status.
5. Keep answers brief (under 120 words), friendly and helpful.
6. If you don't know something specific, suggest the citizen contact the nearest government office.`;

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    // Build conversation history for multi-turn chat
    const chat = model.startChat({
      history: history.slice(-6).map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Chatbot error:', error);
    const fallbacks = {
      en: "I'm having trouble connecting right now. Please try again shortly. For urgent issues, use the 'Lodge Complaint' button.",
      hi: "मुझे अभी कनेक्ट करने में समस्या हो रही है। कृपया थोड़ी देर बाद पुनः प्रयास करें।",
      mr: "मला आत्ता कनेक्ट करण्यात अडचण येत आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.",
      bn: "আমি এখন সংযোগ করতে সমস্যা পাচ্ছি। একটু পরে আবার চেষ্টা করুন।",
    };
    res.json({ reply: fallbacks[req.body.language] || fallbacks.en, error: true });
  }
});

module.exports = router;
