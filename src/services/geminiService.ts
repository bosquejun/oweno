'use client';

import { Group, User } from "@/generated/prisma/client";
import { GoogleGenAI } from "@google/genai";
import { Debt, Expense } from "../types";
import { CURRENCY_SYMBOLS } from "../utils/formatters";

export const getSmartSettleInsights = async (
  group: Group & {members: User[]}, 
  expenses: Expense[], 
  debts: Debt[],
  currencyCode: string = 'PHP'
) => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "AI insights are not available. Please configure your API key.";
  }

  const ai = new GoogleGenAI({ apiKey });
  const symbol = CURRENCY_SYMBOLS[currencyCode] || '₱';
  
  const expenseContext = expenses.map(e => `${e.title}: ${symbol}${e.amount.toLocaleString()}`).join(', ');
  const debtContext = debts.map(d => {
    const from = group.members.find(m => m.id === d.from)?.displayName;
    const to = group.members.find(m => m.id === d.to)?.displayName;
    return `${from} owes ${to} ${symbol}${d.amount.toLocaleString()}`;
  }).join(', ');

  const prompt = `
    Analyze this expense group in the app "OweNo": "${group.name}".
    Currency: ${currencyCode} (${symbol})
    Expenses: ${expenseContext || 'None yet'}
    Calculated Debts: ${debtContext || 'None'}
    
    Provide a very brief (2-3 sentences), warm, and super friendly summary of the group's financial state. 
    Use a casual "barkada" tone (like a close friend). You can occasionally use light Filipino-English slang (Taglish) like "bes", "lods", "tara", or "settle na". 
    Include one smart, encouraging tip on how they could settle up efficiently without the stress. 
    Use the ${symbol} symbol. Keep it positive!
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });
    return response.text || "Working on some smart tips for your group! Give me a second.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The AI is currently catching its breath. Try again in a bit, bes!";
  }
};

