import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
const data = await res.json();
console.log(data.models.map(m => m.name).filter(n => n.includes('embed')));
