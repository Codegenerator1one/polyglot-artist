
// API key should be handled securely in a production environment
const API_KEY = "AIzaSyBnRijcOQvHWx9fdhpd8G0fgvwK_-Ei4kc";

export interface CodeGenerationRequest {
  language: string;
  prompt: string;
  context?: string;
}

export interface CodeGenerationResponse {
  code: string;
  explanation?: string;
  error?: string;
}

export const generateCode = async (request: CodeGenerationRequest): Promise<CodeGenerationResponse> => {
  try {
    // Construct a prompt that instructs the model to generate code
    const systemPrompt = `You are a helpful code generation assistant. Generate only code for the following request, without additional explanations. The code should be in ${request.language}.`;
    
    const userPrompt = `${request.prompt}${request.context ? "\n\nContext: " + request.context : ""}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: systemPrompt }
            ],
            role: "user"
          },
          {
            parts: [
              { text: userPrompt }
            ],
            role: "user"
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated");
    }

    // Extract the code from the response
    const content = data.candidates[0].content;
    if (!content || !content.parts || content.parts.length === 0) {
      throw new Error("Invalid response format");
    }

    // The response may contain markdown code blocks, so we need to extract the code
    const text = content.parts[0].text;
    
    // Extract code from markdown code blocks if present
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    
    const code = match ? match[1].trim() : text.trim();
    
    return { code };
  } catch (error) {
    console.error("Error generating code:", error);
    return { 
      code: "",
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    };
  }
};
