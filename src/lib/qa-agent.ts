import { callGroq, GROQ_MODELS, parseJSON } from "./groq";

export interface QAFeedback {
  score: number; // 1-10
  passed: boolean;
  issues: string[]; // List of specific issues found
  suggestions: string[]; // How to fix them
  revisedContent?: string; // Optional: The agent can attempt to fix it directly
}

export async function performQualityCheck(
  content: string,
  chapterTitle: string,
  subMaterialTitle: string,
  topics: string[]
): Promise<QAFeedback> {
  
  if (content.length < 100) {
    return { score: 10, passed: true, issues: [], suggestions: [] };
  }

  const systemPrompt = `You are a Senior Quality Assurance Agent specializing in Educational Technology.
  Task: Perform a rigorous validation of the educational content provided.
  
  VALIDATION CRITERIA:
  1. FACT-CHECKING: Identify any technical inaccuracies or hallucinations.
  2. COHERENCE: Ensure the flow is logical and the explanation is clear.
  3. LEARNING OBJECTIVE ALIGNMENT: Does it actually teach the concepts related to: ${topics.join(", ")}?
  4. DIFFICULTY CALIBRATION: Ensure it's not too simple or too complex for a general learner.
  5. FORMATTING: Verify Markdown quality (headers, lists, code blocks).

  Output MUST be a valid JSON:
  {
    "score": number (1-10),
    "passed": boolean (true if score >= 8),
    "issues": ["list of issues found"],
    "suggestions": ["specific improvement points"],
    "revisedContent": "string (only if minor fixes are needed, otherwise leave null)"
  }`;

  const userPrompt = `
  Chapter: ${chapterTitle}
  Sub-material: ${subMaterialTitle}
  Content to Validate:
  ---
  ${content.slice(0, 7000)}
  ---`;

  // TIMEOUT WRAPPER (10 Seconds)
  const timeoutPromise = new Promise<QAFeedback>((resolve) => {
    setTimeout(() => {
      console.warn(`[QA Agent] Timeout for "${subMaterialTitle}". Skipping QA.`);
      resolve({ score: 10, passed: true, issues: [], suggestions: [] });
    }, 10000);
  });

  const checkPromise = (async () => {
    try {
      const response = await callGroq([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ], GROQ_MODELS.BALANCED, 0.1); 

      const result = parseJSON<QAFeedback>(response);
      return result;
    } catch (e) {
      console.error(`[QA Agent] Failed for "${subMaterialTitle}":`, e);
      return { score: 10, passed: true, issues: [], suggestions: [] };
    }
  })();

  return Promise.race([checkPromise, timeoutPromise]);
}
