import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      arable_area,
      unit,
      location,
      crop_name,
      season,
      budget_constraint,
      specific_goals,
    } = body

    // Validate required fields
    if (!arable_area || !unit || !location || !crop_name || !season || !budget_constraint) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Construct the prompt for the AI
    const prompt = `You are an expert agronomist and farm financial planner. Your task is to create a detailed crop plan and budget estimation based on the following inputs from a farmer:

- Arable Land Area: ${arable_area} ${unit}
- Location: ${location}
- Desired Crop: ${crop_name}
- Planting Season: ${season}
- Budget Constraint: ${budget_constraint}
- Specific Goals: ${specific_goals || "None specified"}

Provide a structured, concise, and practical response in the following JSON format. Do not include any other text before or after the JSON.

{
  "crop_plan": {
    "recommended_varieties": ["Variety 1", "Variety 2"],
    "planting_calendar": {
      "land_preparation": "Month/Week",
      "sowing": "Month/Week",
      "fertilization_schedule": ["Stage 1: Details", "Stage 2: Details"],
      "irrigation_schedule": ["Stage 1: Details", "Stage 2: Details"],
      "pest_control_schedule": ["Stage 1: Details", "Stage 2: Details"],
      "harvesting": "Month/Week"
    }
  },
  "estimated_budget": {
    "total_estimated_cost": 1234.50,
    "cost_breakdown": {
      "seeds": 100.00,
      "fertilizers": 450.00,
      "pesticides_herbicides": 200.00,
      "irrigation": 150.00,
      "labor": 250.00,
      "fuel_machinery": 300.00,
      "miscellaneous": 50.00
    },
    "notes": "Any assumptions or context for the budget."
  },
  "risk_factors": ["Risk 1: Description", "Risk 2: Description"],
  "additional_recommendations": ["Recommendation 1", "Recommendation 2"]
}`

    // Call AI service to generate crop plan
    // Supports: OpenRouter (recommended), Google Gemini (free), Groq (free), OpenAI
    const aiResponse = await callAIService(prompt)

    // Parse the JSON response from AI
    let result
    try {
      // Clean the response - remove any markdown code blocks if present
      let cleanedResponse = aiResponse.trim()
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       cleanedResponse.match(/```\s*([\s\S]*?)\s*```/)
      
      if (jsonMatch && jsonMatch[1]) {
        cleanedResponse = jsonMatch[1].trim()
      }
      
      // Remove any leading/trailing whitespace or newlines
      cleanedResponse = cleanedResponse.replace(/^[\s\n]*/, '').replace(/[\s\n]*$/, '')
      
      // Parse the JSON
      result = JSON.parse(cleanedResponse)
      
      // Validate that the result has the expected structure
      if (!result.crop_plan || !result.estimated_budget) {
        throw new Error("AI response missing required fields")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.error("Raw AI response:", aiResponse)
      
      // Return a more helpful error message
      return NextResponse.json(
        { 
          error: "Failed to parse AI response. The AI may have returned invalid JSON. Please try again.",
          details: parseError.message 
        },
        { status: 500 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in AI crop planner API:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// Call AI service to generate crop plan
// Supports multiple providers: OpenRouter (recommended), Google Gemini (free), Groq (free), OpenAI
async function callAIService(prompt) {
  const provider = process.env.AI_PROVIDER || "openrouter" // Options: "openrouter", "gemini", "groq", "openai"
  
  switch (provider.toLowerCase()) {
    case "openrouter":
      return await callOpenRouterAPI(prompt)
    case "gemini":
      return await callGeminiAPI(prompt)
    case "groq":
      return await callGroqAPI(prompt)
    case "openai":
      return await callOpenAIAPI(prompt)
    default:
      throw new Error(`Unknown AI provider: ${provider}. Supported: openrouter, gemini, groq, openai`)
  }
}

// OpenRouter API (Access to multiple models including OpenAI)
// Get API key from: https://openrouter.ai/keys
async function callOpenRouterAPI(prompt) {
  const apiKey = process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY environment variable is not set. Get a key from https://openrouter.ai/keys")
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Optional: for tracking
        "X-Title": "AgriProfit AI Crop Planner", // Optional: for tracking
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "openai/gpt-4o", // Default to GPT-4o, can use any model on OpenRouter
        messages: [
          {
            role: "system",
            content: "You are an expert agronomist and farm financial planner with deep knowledge of crop planning, agricultural practices, and farm economics. You provide detailed, practical, and accurate crop plans and budget estimations. Always respond with valid JSON only, following the exact format specified in the user's request. Do not include any explanatory text before or after the JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" }, // Request JSON format response
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        `OpenRouter API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenRouter API")
    }

    const content = data.choices[0].message.content

    if (!content) {
      throw new Error("Empty response from OpenRouter API")
    }

    return content
  } catch (error) {
    console.error("Error calling OpenRouter API:", error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error(`Failed to call OpenRouter API: ${error.message || String(error)}`)
  }
}

// Google Gemini API (FREE TIER: 2M tokens/month)
// Get API key from: https://makersuite.google.com/app/apikey
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set. Get a free key from https://makersuite.google.com/app/apikey")
  }

  try {
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash"
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert agronomist and farm financial planner with deep knowledge of crop planning, agricultural practices, and farm economics. You provide detailed, practical, and accurate crop plans and budget estimations. Always respond with valid JSON only, following the exact format specified. Do not include any explanatory text before or after the JSON.\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
          responseMimeType: "application/json",
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        `Gemini API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("Invalid response format from Gemini API")
    }

    const content = data.candidates[0].content.parts[0].text

    if (!content) {
      throw new Error("Empty response from Gemini API")
    }

    return content
  } catch (error) {
    console.error("Error calling Gemini API:", error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error(`Failed to call Gemini API: ${error.message || String(error)}`)
  }
}

// Groq API (FREE TIER: Very fast, generous limits)
// Get API key from: https://console.groq.com/keys
async function callGroqAPI(prompt) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set. Get a free key from https://console.groq.com/keys")
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-70b-versatile", // Fast and free
        messages: [
          {
            role: "system",
            content: "You are an expert agronomist and farm financial planner with deep knowledge of crop planning, agricultural practices, and farm economics. You provide detailed, practical, and accurate crop plans and budget estimations. Always respond with valid JSON only, following the exact format specified in the user's request. Do not include any explanatory text before or after the JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        `Groq API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from Groq API")
    }

    const content = data.choices[0].message.content

    if (!content) {
      throw new Error("Empty response from Groq API")
    }

    return content
  } catch (error) {
    console.error("Error calling Groq API:", error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error(`Failed to call Groq API: ${error.message || String(error)}`)
  }
}

// OpenAI API (Requires paid credits)
async function callOpenAIAPI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set")
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert agronomist and farm financial planner with deep knowledge of crop planning, agricultural practices, and farm economics. You provide detailed, practical, and accurate crop plans and budget estimations. Always respond with valid JSON only, following the exact format specified in the user's request. Do not include any explanatory text before or after the JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        `OpenAI API error: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenAI API")
    }

    const content = data.choices[0].message.content

    if (!content) {
      throw new Error("Empty response from OpenAI API")
    }

    return content
  } catch (error) {
    console.error("Error calling OpenAI API:", error)
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error(`Failed to call OpenAI API: ${error.message || String(error)}`)
  }
}

