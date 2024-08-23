import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai"; // Ensure OpenAI is properly imported
import axios from "axios"; // Using axios for HTTP requests

const systemPrompt = `You are a flashcard creator.

Create 10 flashcards based on the provided content. Return the flashcards in the following JSON format:
{
    "flashcards": [{
        "front": "str",
        "back": "str"
    }]
}`;

export async function POST(req) {
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_KEY; // Fetch Gemini API key from environment variables
  if (!geminiKey) {
    return NextResponse.json({ error: "Missing Gemini API key" }, { status: 500 });
  }

  const data = await req.text(); // Get user input from request body

  try {
    // Make a request to Gemini's API or OpenAI's API
    const response = await axios.post(
      "https://api.gemini.example.com/v1/your-endpoint", // Replace with the actual Gemini API endpoint
      {
        model: "your-gemini-model", // Replace with the appropriate Gemini model
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: data },
        ],
        // Add any other required parameters here
      },
      {
        headers: {
          Authorization: `Bearer ${geminiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Assuming the API response format is similar to OpenAI's:
    const flashcards = JSON.parse(response.data.choices[0].message.content);
    return NextResponse.json(flashcards.flashcards); // Return the flashcards correctly formatted
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return NextResponse.json({ error: "Error generating flashcards." }, { status: 500 });
  }
}
