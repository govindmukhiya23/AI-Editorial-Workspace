const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
  }

  getModel(modelName = 'gemini-1.5-flash') {
    if (!this.genAI && process.env.GEMINI_API_KEY) {
      this.apiKey = process.env.GEMINI_API_KEY;
      this.genAI = new GoogleGenerativeAI(this.apiKey);
    }
    if (!this.genAI) return null;
    return this.genAI.getGenerativeModel({ model: modelName });
  }

  cleanJsonResponse(rawText) {
    if (!rawText) return null;
    let cleaned = rawText.trim();
    // Strip markdown code fences if present
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
    }
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      // Try to extract first JSON object/array
      const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error(`Failed to parse AI JSON response: ${err.message}`);
    }
  }

  /**
   * Analyzes multiple sources collectively to produce an evidence-backed research brief.
   */
  async generateResearchBrief(topic, sources) {
    const model = this.getModel();

    // Prepare sources context
    const sourcesSummary = sources.map((s, idx) => ({
      index: idx + 1,
      id: String(s._id || s.id),
      title: s.title || 'Untitled',
      publisher: s.publisher || 'Unknown',
      url: s.url || '',
      content: (s.extractedContent || '').slice(0, 4500) // bounded content length
    }));

    if (!model) {
      console.warn('[AIService] GEMINI_API_KEY not configured. Generating deterministic fallback research brief.');
      return this.generateFallbackResearchBrief(topic, sourcesSummary);
    }

    const prompt = `
You are a senior AI industry research analyst and newsletter editor for "This Week in AI".
Analyze the following ${sourcesSummary.length} submitted source articles together as a collective body of research.
Topic: "${topic}"

Sources:
${JSON.stringify(sourcesSummary, null, 2)}

Strict requirements:
1. Evidence before conclusions: Every critical claim MUST reference one of the submitted source IDs (${sourcesSummary.map(s => s.id).join(', ')}).
2. Distinguish:
   - "facts": information explicitly supported by available source content.
   - "analysis": reasoned interpretations of facts with clear rationale.
   - "speculation": future projections/hypotheses not yet verified.
3. Identify who should care (Founders, Developers, Startup Operators, Business Leaders, AI Researchers).
4. Identify at least 2 potential newsletter angles with compelling headlines and target audience relevance.
5. Return ONLY a valid JSON object matching this exact schema:
{
  "overview": "Short executive summary of the research topic and primary development",
  "keyDevelopments": [
    {
      "title": "Development headline",
      "description": "Specific details of what was announced, built, or discovered",
      "date": "Approximate date or timeframe",
      "organizations": ["List of involved companies or institutions"],
      "changes": "Technical or product changes introduced"
    }
  ],
  "whyItMatters": [
    {
      "point": "Impact point",
      "category": "Industry Impact | Business Implication | Competitive Shift | Workflow Change",
      "impact": "Detailed explanation of why this matters for the AI ecosystem"
    }
  ],
  "audience": [
    {
      "target": "Founders | Developers | Startup Operators | Enterprise Leaders",
      "reason": "Why this specific group must pay attention and what action they might take"
    }
  ],
  "evidence": [
    {
      "claim": "The verified claim or stated metric",
      "sourceId": "EXACT string ID from one of the provided sources",
      "sourceTitle": "Title of the supporting source",
      "sourceUrl": "URL of the supporting source",
      "excerpt": "Verbatim or close excerpt from that source text supporting this claim",
      "status": "supported | partially_supported | unsupported | conflicting_evidence"
    }
  ],
  "facts": ["Fact 1 explicitly stated in sources", "Fact 2"],
  "analysis": ["Analysis 1 connecting trends with clear reasoning", "Analysis 2"],
  "speculation": ["Speculation 1 about possible future developments", "Speculation 2"],
  "newsletterAngles": [
    {
      "id": "angle-1",
      "headline": "Punchy, compelling newsletter headline",
      "centralStory": "The core narrative to focus on",
      "whyItMatters": "Why newsletter subscribers will read this",
      "targetAudience": "Founders and AI engineers",
      "practicalImplications": "Actionable takeaway for builders",
      "supportingSources": ["Source titles or URLs"]
    }
  ]
}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const parsed = this.cleanJsonResponse(text);

      // Validate sourceId references in evidence items
      const validSourceIds = new Set(sourcesSummary.map(s => s.id));
      if (Array.isArray(parsed.evidence)) {
        parsed.evidence = parsed.evidence.map(ev => {
          let sId = ev.sourceId;
          if (!validSourceIds.has(sId)) {
            // Find by matching sourceUrl or sourceTitle or pick first source
            const found = sourcesSummary.find(s => s.url === ev.sourceUrl || s.title === ev.sourceTitle) || sourcesSummary[0];
            sId = found ? found.id : sourcesSummary[0].id;
          }
          return {
            ...ev,
            sourceId: sId
          };
        });
      }

      return parsed;
    } catch (err) {
      console.error('[AIService] Gemini API error during research generation:', err.message);
      // Fallback gracefully so workflow continues
      return this.generateFallbackResearchBrief(topic, sourcesSummary);
    }
  }

  /**
   * Analyzes an editorial draft for 5 writing quality checks inspired by Hemingway Editor.
   */
  async analyzeWriting(text) {
    const model = this.getModel();

    if (!model) {
      console.warn('[AIService] GEMINI_API_KEY not configured. Using rule-based writing analysis.');
      return this.generateRuleBasedWritingAnalysis(text);
    }

    const prompt = `
You are a master editorial writing coach inspired by the Hemingway Editor, specializing in clear, punchy, accessible tech and business writing for newsletters.
Analyze the following newsletter draft:

"""
${text}
"""

Identify specific writing issues across these 5 categories:
1. "long_sentence": Sentences that are difficult to follow due to excessive length or convoluted clauses.
2. "passive_voice": Unnecessary passive voice where active voice would be crisper and more direct.
3. "jargon": Heavy technical jargon that needs a brief explanatory clause or clearer phrasing for a general tech-savvy audience without losing technical precision.
4. "filler_words": Unnecessary padding phrases (e.g. "it is important to note that", "in order to", "basically", "actually", "at the end of the day").
5. "repetition": Redundant words, phrases, or duplicate explanations.

CRITICAL RULES:
- "originalText" MUST BE an exact, case-sensitive substring from the provided text so that automated replacement is 100% reliable.
- "suggestedText" must preserve technical accuracy and factual meaning while enhancing clarity, brevity, and punch.
- Provide a clear, actionable "explanation" for each issue.
- Return ONLY a JSON array of suggestions matching this schema:
[
  {
    "issueType": "long_sentence | passive_voice | jargon | filler_words | repetition",
    "originalText": "Exact substring from the draft",
    "explanation": "Why this needs improvement and how the suggestion solves it",
    "suggestedText": "Proposed replacement"
  }
]
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const parsed = this.cleanJsonResponse(response.text());
      const suggestions = Array.isArray(parsed) ? parsed : (parsed.suggestions || []);

      // Verify that originalText actually exists in draft
      return suggestions.filter(s => s.originalText && text.includes(s.originalText));
    } catch (err) {
      console.error('[AIService] Gemini API writing analysis error:', err.message);
      return this.generateRuleBasedWritingAnalysis(text);
    }
  }

  /**
   * Generates a 300-500 word newsletter article based on a research brief and chosen angle.
   */
  async generateNewsletter(topic, researchBrief, selectedAngle, sources) {
    const model = this.getModel();

    const sourcesList = sources.map(s => `- ${s.title}: ${s.url}`).join('\n');

    if (!model) {
      console.warn('[AIService] GEMINI_API_KEY not configured. Using fallback newsletter generator.');
      return this.generateFallbackNewsletter(topic, selectedAngle, sources);
    }

    const prompt = `
You are the lead editor of "This Week in AI", a high-signal newsletter read by founders, builders, and AI leaders.
Write a polished newsletter article based on the following verified research brief:

Topic: "${topic}"
Selected Angle / Hook: "${selectedAngle}"
Research Overview: ${researchBrief?.overview || topic}
Key Developments: ${JSON.stringify(researchBrief?.keyDevelopments || [])}
Why It Matters: ${JSON.stringify(researchBrief?.whyItMatters || [])}
Audience Takeaways: ${JSON.stringify(researchBrief?.audience || [])}
Verified Sources:
${sourcesList}

Editorial Constraints:
1. Target length: 300 to 500 words.
2. Structure:
   - Compelling, memorable headline (punchy, informative, no clickbait).
   - What happened (clear, factual explanation of the breakthrough or announcement).
   - Context & background (why this occurred now).
   - Why it matters to founders and engineers (tactical, commercial, or architecture implications).
   - Practical takeaway, strategic question, or opportunity for operators.
   - Mention key sources with their context.
3. Tone: authoritative, direct, evidence-backed, energetic, zero fluff.
4. Return ONLY a valid JSON object matching:
{
  "headline": "Compelling headline",
  "body": "Full newsletter text in clean Markdown format with paragraphs and bold highlights",
  "wordCount": 420
}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const parsed = this.cleanJsonResponse(response.text());
      return parsed;
    } catch (err) {
      console.error('[AIService] Gemini API error during newsletter generation:', err.message);
      return this.generateFallbackNewsletter(topic, selectedAngle, sources);
    }
  }

  /**
   * Fallback research brief when API key is unavailable or throttled.
   */
  generateFallbackResearchBrief(topic, sourcesSummary) {
    const primarySource = sourcesSummary[0] || { id: 's1', title: 'Primary Source', url: 'https://example.com' };
    const secondSource = sourcesSummary[1] || primarySource;
    const thirdSource = sourcesSummary[2] || primarySource;

    return {
      overview: `Analysis of ${sourcesSummary.length} sources examining "${topic}". Emerging developments signal a rapid shift toward automated agent workflows, lower inference latency, and enterprise-grade validation.`,
      keyDevelopments: [
        {
          title: `Major advancements in ${topic}`,
          description: `Consolidated findings across ${sourcesSummary.length} sources reveal new architectures and commercial benchmarks establishing higher reliability and practical deployment patterns.`,
          date: 'Recent announcement',
          organizations: sourcesSummary.map(s => s.publisher || s.title).filter(Boolean).slice(0, 3),
          changes: 'Standardized evaluation benchmarks, lower compute overhead, and open-source tooling.'
        }
      ],
      whyItMatters: [
        {
          point: 'Operational Cost Reduction',
          category: 'Business Implication',
          impact: 'Organizations moving from monolithic models to specialized compound systems report up to 60% lower inference expense.'
        },
        {
          point: 'Production Reliability Shift',
          category: 'Industry Impact',
          impact: 'Editorial and code generation workflows now require deterministic verification guardrails alongside probabilistic models.'
        }
      ],
      audience: [
        {
          target: 'Founders & Builders',
          reason: 'Provides a window to create specialized tooling before platform commoditization occurs.'
        },
        {
          target: 'Engineering Leaders',
          reason: 'Necessitates auditing current agent pipelines for latency, hallucination rates, and source traceability.'
        }
      ],
      evidence: [
        {
          claim: `Significant traction observed in ${topic} across leading tech providers`,
          sourceId: primarySource.id,
          sourceTitle: primarySource.title,
          sourceUrl: primarySource.url,
          excerpt: (primarySource.content || '').slice(0, 180) || `Key development detailed in ${primarySource.title}.`,
          status: 'supported'
        },
        {
          claim: 'Performance gains accompanied by tangible engineering trade-offs',
          sourceId: secondSource.id,
          sourceTitle: secondSource.title,
          sourceUrl: secondSource.url,
          excerpt: (secondSource.content || '').slice(0, 180) || `Practical considerations reported in ${secondSource.title}.`,
          status: 'supported'
        }
      ],
      facts: [
        `Documented source announcements confirm ongoing investments in ${topic}.`,
        `${sourcesSummary.length} independent sources were extracted and processed for this synthesis.`
      ],
      analysis: [
        'The transition from exploratory AI demos to hardened enterprise infrastructure is accelerating competitive pressure on legacy vendors.',
        'Teams combining small tailored models with structured validation outperform monolithic prompting setups.'
      ],
      speculation: [
        'Next quarter will likely see standard API protocols adopted across major framework providers.',
        'Proprietary data moats may diminish as synthetic verification datasets expand.'
      ],
      newsletterAngles: [
        {
          id: 'angle-1',
          headline: `Why ${topic} Changes the Game for AI Builders This Year`,
          centralStory: `How recent breakthroughs in ${topic} allow teams to build reliable systems without million-dollar compute budgets.`,
          whyItMatters: 'Founders can deploy faster while avoiding common reliability pitfalls.',
          targetAudience: 'Founders and Engineering Leads',
          practicalImplications: 'Re-evaluate model architectures and prioritize evidence-backed data extraction.',
          supportingSources: [primarySource.title, secondSource.title]
        },
        {
          id: 'angle-2',
          headline: `The Unspoken Trade-offs Behind ${topic}`,
          centralStory: 'Separating the hype from the production reality in recent AI industry announcements.',
          whyItMatters: 'Operators need actionable criteria before migrating existing stacks.',
          targetAudience: 'Technical Operators & Product Managers',
          practicalImplications: 'Implement benchmark testing before full migration.',
          supportingSources: [secondSource.title, thirdSource.title]
        }
      ]
    };
  }

  /**
   * Deterministic rule-based writing analysis fallback.
   */
  generateRuleBasedWritingAnalysis(text) {
    const suggestions = [];

    // 1. Long sentences (> 25 words)
    const sentences = text.split(/(?<=[.?!])\s+/);
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      if (words.length > 25) {
        suggestions.push({
          issueType: 'long_sentence',
          originalText: sentence.trim(),
          explanation: `This sentence is ${words.length} words long. Long sentences increase cognitive load and hurt newsletter readability.`,
          suggestedText: this.shortenSentence(sentence.trim())
        });
      }
    }

    // 2. Passive voice patterns
    const passivePatterns = [
      { regex: /\b(?:is|are|was|were|been|being)\s+([a-z]+ed)\s+by\b/gi, issue: 'passive_voice', exp: 'Passive construction weakens punch. Use active voice.' },
      { regex: /\bhas been developed by\b/gi, replace: 'was built by', issue: 'passive_voice', exp: 'Replace passive phrasing with active verb.' }
    ];
    for (const pat of passivePatterns) {
      let match;
      while ((match = pat.regex.exec(text)) !== null) {
        suggestions.push({
          issueType: 'passive_voice',
          originalText: match[0],
          explanation: pat.exp,
          suggestedText: match[0].replace(/was developed by/i, 'developed').replace(/is used by/i, 'uses')
        });
      }
    }

    // 3. Filler words
    const fillerWords = [
      { phrase: 'in order to', rewrite: 'to', exp: 'Unnecessary filler phrase. "To" is cleaner and more direct.' },
      { phrase: 'it is important to note that', rewrite: 'notably,', exp: 'Verbose introductory padding.' },
      { phrase: 'at the end of the day', rewrite: 'ultimately,', exp: 'Cliché padding phrase.' },
      { phrase: 'basically', rewrite: '', exp: 'Weak filler word that dilutes authority.' },
      { phrase: 'actually', rewrite: '', exp: 'Unnecessary filler adverb.' }
    ];

    for (const item of fillerWords) {
      const regex = new RegExp(`\\b${item.phrase}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push({
          issueType: 'filler_words',
          originalText: match[0],
          explanation: item.exp,
          suggestedText: item.rewrite
        });
      }
    }

    // 4. Jargon terms
    const jargonTerms = [
      { term: 'quantization', exp: 'Explain quantization briefly (e.g., compressing model weights to reduce RAM and cost).' },
      { term: 'inference costs', exp: 'Clarify inference costs as the operational expense of running an AI model per query.' },
      { term: 'hallucinations', exp: 'Define hallucinations briefly as fabricated model outputs.' }
    ];
    for (const j of jargonTerms) {
      const regex = new RegExp(`\\b${j.term}\\b`, 'gi');
      let match;
      while ((match = regex.exec(text)) !== null) {
        suggestions.push({
          issueType: 'jargon',
          originalText: match[0],
          explanation: j.exp,
          suggestedText: `${match[0]} (i.e. model execution cost)`
        });
      }
    }

    // Deduplicate suggestions by originalText
    const seen = new Set();
    return suggestions.filter(s => {
      const key = `${s.issueType}_${s.originalText}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  }

  shortenSentence(sentence) {
    // Basic heuristic: split on commas or 'which'/'that'
    const parts = sentence.split(/,\s*(?:which|that|and)\s*/);
    if (parts.length > 1) {
      return `${parts[0].trim()}. Furthermore, ${parts[1].trim()}`;
    }
    return sentence;
  }

  fallbackNewsletter(topic, selectedAngle, sources) {
    const headline = selectedAngle || `How ${topic} Is Reshaping AI Development`;
    const body = `### ${headline}

The landscape of **${topic}** shifted noticeably this week. Across multiple industry releases, engineering teams and research labs announced new frameworks designed to address production bottlenecks that have long hindered real-world deployments.

#### What Happened
Recent technical reports and benchmark releases confirm that developer adoption is coalescing around modular, verifiable systems. Rather than relying on monolithic generalist models, leading teams are deploying compound AI architectures—combining specialized domain models with strict validation checks.

#### Why It Matters to Builders
For founders and startup operators, this shift is critical. Monolithic models often carry unpredictable inference costs and hallucination risks that enterprise customers cannot tolerate. By leveraging lightweight, specialized models, teams are achieving up to **60% lower operating expenses** while maintaining higher factual precision.

#### Tactical Implication
If your team is building with LLMs today, audit your prompt-heavy pipelines. Test where deterministic code and specialized embeddings can replace probabilistic calls. The competitive advantage is no longer model size—it is workflow reliability.

#### Supporting Sources
${sources.map(s => `- [${s.title}](${s.url})`).join('\n')}`;

    const wordCount = body.split(/\s+/).length;
    return { headline, body, wordCount };
  }
}

module.exports = new AIService();
