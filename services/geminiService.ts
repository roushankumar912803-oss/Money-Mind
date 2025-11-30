import { GoogleGenAI } from "@google/genai";
import { Transaction, MonthlyData, Goal, EducationResource, NewsArticle, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_FAST = 'gemini-2.5-flash';

// --- Finance Tips & Analysis ---
export const getFinancialAdvice = async (
  transactions: Transaction[],
  monthlyData: MonthlyData,
  goals: Goal[]
): Promise<string> => {
  const prompt = `
    Analyze the following financial data and provide 3 concise, actionable tips to improve financial health.
    Focus on spending habits, asset allocation, and goal progress.

    Data:
    - Recent Daily Transactions: ${JSON.stringify(transactions.slice(0, 20))}
    - Monthly Income/Fixed: ${JSON.stringify({ salary: monthlyData.salary, side: monthlyData.sideIncome, fixedInv: monthlyData.investments })}
    - Assets/Liabilities: Assets Total ${monthlyData.assets.reduce((a, b) => a + b.amount, 0)}, Liabilities Total ${monthlyData.liabilities.reduce((a, b) => a + b.amount, 0)}
    - Goals: ${JSON.stringify(goals)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        systemInstruction: "You are a savvy personal finance advisor. Be encouraging but direct. Keep advice under 150 words total.",
      }
    });
    return response.text || "Unable to generate advice at the moment.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "AI service is currently unavailable. Please check your connection.";
  }
};

// --- AI Budget Instructor ---
export const generateBudgetPlan = async (name: string, salary: number, currency: string): Promise<string> => {
  const prompt = `
    Act as an expert Personal Finance Instructor. The user's name is ${name}. The user has a monthly income of ${salary} ${currency}.
    Create a detailed, best-practice financial plan for them. Start by addressing them by name.
    
    Structure your response with:
    1. **The Split**: Recommend a budget split (e.g., 50/30/20 or similar) appropriate for this income, showing exact amounts for Needs, Wants, and Savings.
    2. **Investment Strategy**: Suggest where to allocate the savings (e.g., Emergency Fund, Stocks/SIPs, Retirement). Be specific but add a disclaimer that this is educational.
    3. **Smart Expense Management**: 3 specific tips to manage expenses for this income bracket.
    4. **Growth**: One tip on how to potentially increase this income or wealth over time.
    
    Format using clean Markdown (bolding, lists). Keep it professional, motivating, and easy to read.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });
    return response.text || "Could not generate a budget plan. Please try again.";
  } catch (error) {
    console.error("Gemini Budget Plan Error:", error);
    return "AI service is currently unavailable. Please check your connection.";
  }
};

// --- Educational Content (Search Grounding) ---
export const getEducationContent = async (topic: string): Promise<EducationResource[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: `Find 3 highly-rated YouTube videos explaining "${topic}". Focus on Personal Finance channels. Return the video title and specific YouTube watch URL.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const resources: EducationResource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web) {
          resources.push({
            title: chunk.web.title || "Learn Finance",
            description: "Watch this video to learn more.",
            url: chunk.web.uri || "#",
            sourceTitle: "YouTube"
          });
        }
      });
    }

    return Array.from(new Map(resources.map(item => [item.url, item])).values()).slice(0, 6);
  } catch (error) {
    console.error("Gemini Education Error:", error);
    return [];
  }
};

// --- News Updates (Search Grounding) ---
export const getFinanceNews = async (): Promise<NewsArticle[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: "What are the top 5 most important financial news headlines today in India? Return them as a list.",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const articles: NewsArticle[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.web) {
          articles.push({
            title: chunk.web.title || "Financial News",
            url: chunk.web.uri || "#",
            source: "Google Search"
          });
        }
      });
    }

    // Filter duplicates by URL
    const uniqueArticles = Array.from(new Map(articles.map(item => [item.url, item])).values());
    return uniqueArticles.slice(0, 6);
  } catch (error) {
    console.error("Gemini News Error:", error);
    return [];
  }
};

// --- Smart Import: Parse Transactions from Text ---
export const parseTransactionsFromText = async (text: string): Promise<Partial<Transaction>[]> => {
  const prompt = `
    Extract financial transactions from the following text (which might be SMS logs, bank statements, or natural language).
    
    Text: "${text.substring(0, 2000)}"

    Rules:
    1. Identify Date (YYYY-MM-DD), Amount (number), Type ('income' or 'expense'), Description (short string), and Category.
    2. Categorize expenses into one of: ${EXPENSE_CATEGORIES.join(', ')}.
    3. Categorize income into one of: ${INCOME_CATEGORIES.join(', ')}.
    4. If the text says "Paid" or "Debit", it's an expense. If "Received" or "Credit", it's income.
    5. Return a strict JSON array of objects. Do not include markdown formatting.
    
    Example Output format:
    [{"date": "2023-10-27", "amount": 500, "type": "expense", "category": "Food", "description": "Lunch at McD"}]
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const rawText = response.text || "[]";
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return [];
  }
};