import crypto from 'crypto';
import { aiJsonGenerate, isGeminiConfigured } from '../utils/geminiAI.js';
import { generatePptContent, generatePdfContent } from '../utils/localAI.js';

// System prompts
const SYSTEM_PROMPT_PPT = `You are a professional presentation architect similar to Gamma.
Your task is to transform a user prompt into a complete presentation.
Generate presentation-ready content.
Requirements:
- Clear slide hierarchy
- Professional structure
- Concise bullet points
- Maximum 5 bullets per slide
- Maximum 15 words per bullet
- Logical flow
- Include charts when appropriate
- Include image recommendations
- Include speaker notes
- Generate between 10 and 20 slides.

Return valid JSON only matching the schema specified.`;

const FORMAT_INSTRUCTION_PPT = `
Return ONLY a valid JSON object matching the following structure:
{
  "presentationTitle": "Title of the presentation",
  "theme": "Modern Blue, Forest Green, Dark Mode Minimalist, Warm Terracotta, or Vibrant Sunset",
  "slides": [
    {
      "slideNumber": 1,
      "type": "One of: 'Title Slide', 'Content Slide', 'Two Column', 'Image Left', 'Image Right', 'Comparison', 'Timeline', 'Chart Slide', 'Conclusion Slide'",
      "title": "Slide Title",
      "subtitle": "Optional slide subtitle or category",
      "content": ["Up to 5 concise bullet points"],
      "speakerNotes": "Speaker notes for this slide",
      "imagePrompt": "Detailed visual/image description for this slide",
      "chartType": "One of: 'bar', 'line', 'pie', 'doughnut', or empty string"
    }
  ]
}
Do not include any other markdown text, formatting, or wraps like \`\`\`json.
`;

const SYSTEM_PROMPT_PDF = `You are an expert Presentation Architect, Report Writer, Research Analyst, Business Consultant, and Technical Documentation Specialist.
Your job is to convert natural language prompts into complete professional presentations and documents.
Automatically determine:
- Structure
- Sections
- Flow
- Visual hierarchy
- Content organization
Generate professional, concise, high-quality content.
Use logical progression.
Avoid unnecessary filler.
Generate presentation-ready and publication-ready output.`;

const FORMAT_INSTRUCTION_PDF = `
Return ONLY a valid JSON object matching the following structure:
{
  "documentTitle": "Title of the Document",
  "documentType": "One of: Research Paper, Project Report, Assignment, Whitepaper, Business Report, Study Notes, Technical Documentation",
  "theme": "Modern Blue, Forest Green, Dark Mode Minimalist, Warm Terracotta, or Vibrant Sunset",
  "executiveSummary": "A concise executive summary paragraph.",
  "tableOfContents": [
     "Section Title 1",
     "Section Title 2"
  ],
  "sections": [
    {
      "sectionTitle": "Section Title",
      "subsections": [
        {
          "subsectionTitle": "Subsection Title",
          "paragraphs": [
            "Detailed paragraph content block...",
            "Another detailed paragraph..."
          ],
          "table": {
            "headers": ["Header A", "Header B"],
            "rows": [
              ["Value A1", "Value B1"],
              ["Value A2", "Value B2"]
            ]
          },
          "chart": {
            "type": "bar",
            "data": [
              {"label": "Label A", "value": 30},
              {"label": "Label B", "value": 70}
            ]
          }
        }
      ]
    }
  ],
  "references": [
    "Reference item 1",
    "Reference item 2"
  ]
}
Note: Leave the "table" or "chart" object null or empty if not appropriate for the subsection content. Do not include markdown codeblocks around the JSON.
`;

const SYSTEM_PROMPT_AVATAR_ENHANCEMENT = `You are a professional prompt engineer for image generation models (like Stable Diffusion 3.5).
Your task is to transform a short user description and a selected style into a highly detailed avatar-generation prompt.

Input format:
{
"description": "<user description>",
"style": "<anime | realistic | 3d>"
}

Output format:
{
"title": "<short descriptive title>",
"style": "<style name>",
"enhancedPrompt": "<highly detailed, visually descriptive prompt suitable for Stable Diffusion>",
"negativePrompt": "<comma-separated list of elements to avoid>"
}

RULES:
1. Preserve user intent and core subject.
2. Expand the short prompt/description into a rich visual description.
3. Generate avatar-specific prompts focusing on face, expression, lighting, composition, colors, and quality.
4. Optimize for profile pictures.
5. Do NOT include markdown formatting (like \`\`\`json) or explanations in the response. Return ONLY valid raw JSON.
6. Incorporate the following style-specific and global guidelines:

GLOBAL AVATAR REQUIREMENTS:
Every generated avatar must include: centered composition, head and shoulders framing, premium profile picture quality, sharp facial details, balanced lighting, clean background, visually appealing composition, high resolution, strong focus on subject, professional quality, social media ready, high detail.

STYLE: ANIME (if style is "anime")
Requirements to include/integrate: masterpiece anime artwork, modern anime aesthetic, detailed expressive eyes, vibrant colors, detailed hair, polished illustration, cinematic lighting, clean line art, premium character design, studio quality artwork, anime portrait, visually striking color palette, professional avatar composition.
Negative Prompt: blurry, low quality, bad anatomy, distorted face, extra limbs, extra fingers, watermark, text, cropped face, duplicate features

STYLE: REALISTIC (if style is "realistic")
Requirements to include/integrate: ultra realistic portrait, DSLR quality photography, cinematic lighting, realistic skin texture, natural color grading, shallow depth of field, premium headshot, highly detailed facial features, realistic proportions, professional photography, modern portrait style, sharp focus.
Negative Prompt: blurry, low quality, distorted face, bad proportions, extra limbs, extra fingers, watermark, text, overexposed, underexposed

STYLE: 3D RENDER (if style is "3d" or "3d render")
Requirements to include/integrate: Pixar-quality rendering, AAA game character quality, realistic materials, global illumination, detailed shaders, studio lighting, premium character model, cinematic render, high-quality textures, professional avatar render, realistic depth, polished materials.
Negative Prompt: low poly, blurry, bad topology, poor textures, distorted face, extra limbs, watermark, text, poor lighting
`;

const isKeyValid = (key) => {
    return key && key !== 'your_openai_api_key_here' && key !== 'your_huggingface_api_key_here' && key !== '';
};

// Generates a mock presentation JSON structure in case AI APIs are completely offline
const getMockPresentationJson = (topic) => {
    const cleanTopic = topic || 'Artificial Intelligence';
    return {
        presentationTitle: cleanTopic,
        theme: "Modern Blue",
        slides: [
            {
                slideNumber: 1,
                type: "Title Slide",
                title: cleanTopic,
                subtitle: "A Comprehensive Overview and Strategic Roadmap",
                content: [],
                speakerNotes: "Welcome everyone to this presentation. Today we will discuss " + cleanTopic + ".",
                imagePrompt: "Title cover graphic for " + cleanTopic,
                chartType: ""
            },
            {
                slideNumber: 2,
                type: "Content Slide",
                title: "Introduction & Context",
                subtitle: "Setting the Stage",
                content: [
                    "Definition and core concepts of the field",
                    "Historical background and evolutionary timeline",
                    "Major drivers accelerating development today",
                    "Key stakeholders and industry landscape"
                ],
                speakerNotes: "Let us start by understanding the foundational context.",
                imagePrompt: "Concept map of " + cleanTopic,
                chartType: ""
            },
            {
                slideNumber: 3,
                type: "Two Column",
                title: "Core Mechanics and Pillars",
                subtitle: "Technical Architecture",
                content: [
                    "First key pillar: foundational architecture and systems",
                    "Second key pillar: data ingestion, processing, and storage pipelines",
                    "Third key pillar: algorithmic modelling and computing infrastructures",
                    "Fourth key pillar: deployment frameworks, containerization, and API layers"
                ],
                speakerNotes: "Here we outline the structural pillars of " + cleanTopic + ".",
                imagePrompt: "Technical diagram showing 4 pillars",
                chartType: ""
            },
            {
                slideNumber: 4,
                type: "Image Left",
                title: "Primary Applications",
                subtitle: "Real-world impact",
                content: [
                    "Industrial automation and smart workflows",
                    "Consumer services and hyper-personalized experiences",
                    "Scientific research breakthrough modeling",
                    "Financial analytics and automated risk modeling"
                ],
                speakerNotes: "This slide shows how these systems are applied in the real world.",
                imagePrompt: "A sleek infographic illustrating global technology applications",
                chartType: ""
            },
            {
                slideNumber: 5,
                type: "Image Right",
                title: "Key Market Trends",
                subtitle: "What lies ahead",
                content: [
                    "Rapid adoption across enterprise operations",
                    "Convergence with edge computing technologies",
                    "Increased focus on security and privacy safeguards",
                    "Growth in open-source developer communities"
                ],
                speakerNotes: "Now let us examine the main trends currently shaping the market.",
                imagePrompt: "A futuristic chart illustrating rising trends",
                chartType: ""
            },
            {
                slideNumber: 6,
                type: "Comparison",
                title: "Strengths vs. Challenges",
                subtitle: "Strategic Trade-offs",
                content: [
                    "High efficiency and speed of execution",
                    "Scalable across various dimensions",
                    "Data-driven decision making capabilities",
                    "High initial infrastructure setup cost",
                    "Complexity in debugging edge cases",
                    "Dependence on continuous high-quality data input"
                ],
                speakerNotes: "Let's compare the strategic benefits against the implementation challenges.",
                imagePrompt: "Balance scale weighing pros and cons",
                chartType: ""
            },
            {
                slideNumber: 7,
                type: "Timeline",
                title: "Implementation Roadmap",
                subtitle: "Key Milestones",
                content: [
                    "Phase 1: Research and foundational design",
                    "Phase 2: Prototyping and early testing",
                    "Phase 3: Scaled deployment and training",
                    "Phase 4: Optimization and global launch"
                ],
                speakerNotes: "Our deployment plan is structured across four distinct phases.",
                imagePrompt: "Roadmap progression arrow graphic",
                chartType: ""
            },
            {
                slideNumber: 8,
                type: "Chart Slide",
                title: "Market Adoption Statistics",
                subtitle: "Growth Metrics",
                content: [
                    "Category A shows a steady 30% baseline",
                    "Category B experiences rapid growth reaching 50%",
                    "Category C remains at a solid 20% niche",
                    "Category D dominates with a massive 70% adoption rate"
                ],
                speakerNotes: "This chart visualizes the adoption distribution across four key categories.",
                imagePrompt: "A professional adoption bar chart",
                chartType: "bar"
            },
            {
                slideNumber: 9,
                type: "Content Slide",
                title: "Future Outlook & Horizons",
                subtitle: "Next Generation Solutions",
                content: [
                    "Integration with quantum computing infrastructures",
                    "Fully self-healing and self-optimizing pipelines",
                    "Democratization of tools to non-technical creators",
                    "Pervasive embedding in daily operations globally"
                ],
                speakerNotes: "Looking forward, the future holds exciting breakthrough horizons.",
                imagePrompt: "Abstract bright light representing future horizon",
                chartType: ""
            },
            {
                slideNumber: 10,
                type: "Conclusion Slide",
                title: "Summary & Key Takeaways",
                subtitle: "Final Thoughts",
                content: [
                    "Strategic alignment is essential for successful adoption",
                    "Continuous monitoring and data governance are non-negotiable",
                    "Invest in skills training to maximize the return on investment",
                    "Start with focused high-impact use cases before scaling"
                ],
                speakerNotes: "Thank you for your time. I am happy to open the floor to any questions.",
                imagePrompt: "Slide thanking audience for their attention",
                chartType: ""
            }
        ]
    };
};

// Generates a mock PDF JSON structure in case AI APIs are completely offline
const getMockReportJson = (topic) => {
    const cleanTopic = topic || 'Quantum Computing';
    return {
        documentTitle: cleanTopic,
        documentType: "Project Report",
        theme: "Modern Blue",
        executiveSummary: `This comprehensive report explores the fundamentals, current applications, and strategic roadmaps for ${cleanTopic}. As organizations look to optimize operations and capture new value, understanding the dynamics of this domain becomes critical. We analyze the market, dissect technical pillars, and lay out actionable steps for adoption.`,
        tableOfContents: [
            "1. Introduction & Foundational Concepts",
            "2. Technical Architecture & Core Pillars",
            "3. Market Analysis & Industry Adoption",
            "4. Implementation Strategy & Roadmap",
            "5. Conclusion & Recommendations"
        ],
        sections: [
            {
                sectionTitle: "1. Introduction & Foundational Concepts",
                subsections: [
                    {
                        subsectionTitle: "Overview of the Domain",
                        paragraphs: [
                            `The field of ${cleanTopic} represents a paradigm shift in modern industry and technology. By leveraging state-of-the-art architectures, organizations can achieve efficiencies that were previously considered impossible.`,
                            "To fully appreciate the scope of this report, we must trace the historical developments that brought us here, starting with research prototypes to commercial cloud solutions."
                        ]
                    }
                ]
            },
            {
                sectionTitle: "2. Technical Architecture & Core Pillars",
                subsections: [
                    {
                        subsectionTitle: "Detailed Infrastructure Analysis",
                        paragraphs: [
                            "Behind any successful deployment is a robust, layered technical architecture. This section breaks down the data ingestion, computing, and integration layers.",
                            "The system operates with strict latency constraints, ensuring real-time response capability and high availability."
                        ],
                        table: {
                            headers: ["Component Name", "Role", "Performance Rating"],
                            rows: [
                                ["Ingestion Engine", "Data Pipeline Inflow", "Optimized (99.8%)"],
                                ["Processing Node", "Algorithmic Compute", "High (94.5%)"],
                                ["Storage Registry", "State Management", "Reliable (99.9%)"]
                            ]
                        }
                    }
                ]
            },
            {
                sectionTitle: "3. Market Analysis & Industry Adoption",
                subsections: [
                    {
                        subsectionTitle: "Market Share and Competitiveness",
                        paragraphs: [
                            "Adoption curves reveal significant growth across multiple key verticals. Retail and finance lead the charge, with manufacturing catching up quickly.",
                            "The chart below represents the current market adoption indices across four major study regions."
                        ],
                        chart: {
                            type: "bar",
                            data: [
                                { "label": "Region A", "value": 30 },
                                { "label": "Region B", "value": 50 },
                                { "label": "Region C", "value": 20 },
                                { "label": "Region D", "value": 70 }
                            ]
                        }
                    }
                ]
            },
            {
                sectionTitle: "4. Implementation Strategy & Roadmap",
                subsections: [
                    {
                        subsectionTitle: "Action Plan for Enterprises",
                        paragraphs: [
                            "Successful adoption requires a phased, disciplined approach. We recommend starting with a pilot phase, training internal resources, and establishing a clear governance model.",
                            "Always ensure data security compliance protocols are verified at every checkpoint of the integration roadmap."
                        ]
                    }
                ]
            },
            {
                sectionTitle: "5. Conclusion & Recommendations",
                subsections: [
                    {
                        subsectionTitle: "Key Takeaways",
                        paragraphs: [
                            `In summary, ${cleanTopic} is no longer a futuristic concept but a present-day business imperative. Organizations that act quickly to integrate these patterns will secure a long-term competitive advantage.`,
                            "We recommend immediate investment in foundational pilot studies to test compatibility with existing systems."
                        ]
                    }
                ]
            }
        ],
        references: [
            "National Institute of Technology, Annual Review of Computing Research (2025).",
            "Global Technology Adoption Index Report, TechInsights Publishing.",
            "Understanding System Architectural Paradigms, Academic Press, Vol. 44."
        ]
    };
};

export const generatePresentationJson = async (promptText) => {
    // 1. Try Groq/Pollinations AI for rich, unique content
    const aiResult = await aiJsonGenerate(SYSTEM_PROMPT_PPT, `Create a structured presentation about: '${promptText}'\n\n${FORMAT_INSTRUCTION_PPT}`);
    if (aiResult) {
        console.log('[PPT] ✓ AI-generated');
        return aiResult;
    }
    // 2. Local template fallback
    console.log('[PPT] Using local template generator');
    return generatePptContent(promptText);
};

export const generateReportJson = async (promptText) => {
    // 1. Try Groq/Pollinations AI for rich, unique content
    const aiResult = await aiJsonGenerate(SYSTEM_PROMPT_PDF, `Create a structured publication-ready document about: '${promptText}'\n\n${FORMAT_INSTRUCTION_PDF}`);
    if (aiResult) {
        console.log('[PDF] ✓ AI-generated');
        return aiResult;
    }
    // 2. Local template fallback
    console.log('[PDF] Using local template generator');
    return generatePdfContent(promptText);
};

export const enhanceAvatarPrompt = async (description, style) => {
    // Local prompt enhancement â€” no API needed
    const title = `${style.charAt(0).toUpperCase() + style.slice(1)} ${description} Avatar`;
    const globalReqs = "centered composition, head and shoulders framing, premium profile picture quality, sharp facial details, balanced lighting, clean background, high resolution, strong focus on subject, professional quality, social media ready";

    let enhancedPrompt = "";
    let negativePrompt = "";

    if (style === 'anime') {
        enhancedPrompt = `A centered anime character profile picture of ${description}, masterpiece anime artwork, modern anime aesthetic, detailed expressive eyes, vibrant colors, detailed hair, polished illustration, cinematic lighting, clean line art, premium character design, studio quality, professional avatar composition, ${globalReqs}`;
        negativePrompt = "blurry, low quality, bad anatomy, distorted face, extra limbs, extra fingers, watermark, text, cropped face, duplicate features";
    } else if (style === 'realistic') {
        enhancedPrompt = `A centered realistic portrait avatar of ${description}, ultra realistic portrait, DSLR quality photography, cinematic lighting, realistic skin texture, natural color grading, shallow depth of field, premium headshot, highly detailed facial features, realistic proportions, professional photography, modern portrait style, sharp focus, ${globalReqs}`;
        negativePrompt = "blurry, low quality, distorted face, bad proportions, extra limbs, extra fingers, watermark, text, overexposed, underexposed";
    } else {
        // 3D Render
        enhancedPrompt = `A centered 3D render avatar of ${description}, Pixar-quality rendering, AAA game character quality, realistic materials, global illumination, detailed shaders, studio lighting, premium character model, cinematic render, high-quality textures, professional avatar render, realistic depth, polished materials, ${globalReqs}`;
        negativePrompt = "low poly, blurry, bad topology, poor textures, distorted face, extra limbs, watermark, text, poor lighting";
    }

    return { title, style, enhancedPrompt, negativePrompt };
};

export const enhanceImagePrompt = async (prompt) => {
    // Local prompt enhancement â€” no API needed
    return {
        title: prompt.slice(0, 50),
        enhancedPrompt: `${prompt}, highly detailed, sharp focus, vibrant colors, professional quality, cinematic lighting, 8k resolution, visually striking composition`
    };
};

export const generateDalleImage = async (prompt) => {
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!isKeyValid(openaiKey)) {
        throw new Error('OpenAI API key is missing or not configured');
    }

    console.log('[AI Service] Generating image with DALL-E 3...');
    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            size: '1024x1024',
            quality: 'hd',
            n: 1,
            style: 'vivid'
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI DALL-E failed: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    const imageUrl = resJson.data[0].url;

    // Download the generated image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
        throw new Error(`Failed to download generated image from ${imageUrl}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
};

export const generateGeminiSvg = async (enhancedPrompt, style) => {
    // Route straight to programmatic SVG â€” no Gemini needed
    return generateProgrammaticSvg(enhancedPrompt, style);
};
export const generateProgrammaticSvg = (prompt, style) => {
    console.log('[AI Service] Generating Programmatic Hashing-based SVG...');
    const promptLower = (prompt || '').toLowerCase();
    
    // Hash input to derive consistent visual elements
    const h = crypto.createHash('md5').update(promptLower).digest('hex');
    const val1 = parseInt(h.substring(0, 4), 16);
    const val2 = parseInt(h.substring(4, 8), 16);
    const val3 = parseInt(h.substring(8, 12), 16);

    const palettes = [
        { primary: "#8B5CF6", secondary: "#EC4899", accent: "#FBBF24", bgStart: "#2E1065", bgEnd: "#0F052D" }, // Purple Magic
        { primary: "#3B82F6", secondary: "#1D4ED8", accent: "#60A5FA", bgStart: "#1E3A8A", bgEnd: "#0F172A" }, // Ocean Blue
        { primary: "#06B6D4", secondary: "#3B82F6", accent: "#10B981", bgStart: "#083344", bgEnd: "#021520" }, // Cyber Cyan
        { primary: "#10B981", secondary: "#84CC16", accent: "#F59E0B", bgStart: "#064E3B", bgEnd: "#022C22" }, // Forest Green
        { primary: "#F97316", secondary: "#EF4444", accent: "#FBBF24", bgStart: "#431407", bgEnd: "#0C0402" }, // Sunset Orange
        { primary: "#F59E0B", secondary: "#D97706", accent: "#FCD34D", bgStart: "#3C2005", bgEnd: "#0F0800" }, // Royal Gold
        { primary: "#EC4899", secondary: "#F43F5E", accent: "#A855F7", bgStart: "#500724", bgEnd: "#1C000B" }, // Sakura Pink
        { primary: "#64748B", secondary: "#1E293B", accent: "#EF4444", bgStart: "#0F172A", bgEnd: "#020617" }, // Stealth Dark
        { primary: "#EF4444", secondary: "#B91C1C", accent: "#3B82F6", bgStart: "#450A0A", bgEnd: "#150202" }, // Crimson Red
        { primary: "#10B981", secondary: "#06B6D4", accent: "#FCD34D", bgStart: "#022C22", bgEnd: "#021520" }  // Neon Green
    ];

    const cleanPrompt = promptLower.replace(/[^a-z0-9 ]/g, ' ');
    const words = new Set(cleanPrompt.split(' '));

    const isApple = ['apple', 'fruit', 'cherry', 'strawberry', 'red'].some(w => words.has(w));
    const isDeveloper = ['dev', 'developer', 'code', 'coder', 'software', 'tech', 'computer', 'hacker', 'engineer', 'programming'].some(w => words.has(w));
    const isCyber = ['cyber', 'warrior', 'space', 'astronaut', 'futuristic', 'robot', 'mech', 'sci-fi', 'scifi'].some(w => words.has(w));
    const isElf = ['elf', 'nature', 'forest', 'tree', 'green', 'fantasy'].some(w => words.has(w));
    const isNinja = ['ninja', 'samurai', 'shadow', 'warrior', 'sword', 'fight'].some(w => words.has(w));
    const isWizard = ['wizard', 'magic', 'spell', 'witch', 'sorcerer', 'star'].some(w => words.has(w));

    let allowedPalettes = Array.from({ length: palettes.length }, (_, idx) => idx);
    let allowedDecorations = ["tech_grid", "stars", "leaves", "geometric", "digital_rain", "target"];
    let allowedSymbols = ["apple", "code", "gear", "space_ship", "helmet", "mask", "star", "sword", "wand", "leaf", "shield", "crown", "heart", "key", "globe", "compass", "flame"];

    if (isApple) {
        allowedPalettes = [8, 4, 6]; // Crimson Red, Sunset Orange, Sakura Pink
        allowedDecorations = ["leaves", "geometric"];
        allowedSymbols = ["apple", "heart", "star"];
    } else if (isDeveloper) {
        allowedPalettes = [2, 1, 9, 7];
        allowedDecorations = ["tech_grid", "digital_rain"];
        allowedSymbols = ["code", "gear", "key"];
    } else if (isCyber) {
        allowedPalettes = [6, 2, 1, 0];
        allowedDecorations = ["target", "tech_grid", "stars"];
        allowedSymbols = ["helmet", "space_ship", "shield", "globe", "compass"];
    } else if (isElf) {
        allowedPalettes = [3, 9, 1];
        allowedDecorations = ["leaves", "geometric"];
        allowedSymbols = ["leaf", "globe", "compass"];
    } else if (isNinja) {
        allowedPalettes = [7, 8, 4];
        allowedDecorations = ["target", "tech_grid"];
        allowedSymbols = ["mask", "sword", "shield"];
    } else if (isWizard) {
        allowedPalettes = [0, 5];
        allowedDecorations = ["stars", "geometric"];
        allowedSymbols = ["wand", "star", "flame", "crown"];
    }

    const paletteIdx = allowedPalettes[val1 % allowedPalettes.length];
    const selectedPalette = palettes[paletteIdx];

    const primaryColor = selectedPalette.primary;
    const secondaryColor = selectedPalette.secondary;
    const accentColor = selectedPalette.accent;
    const bgGradientStart = selectedPalette.bgStart;
    const bgGradientEnd = selectedPalette.bgEnd;

    const decType = allowedDecorations[val2 % allowedDecorations.length];
    let styleDecorations = "";

    if (decType === "tech_grid") {
        styleDecorations = `
        <g opacity="0.08">
            <path d="M 0,100 L 1024,100 M 0,200 L 1024,200 M 0,300 L 1024,300 M 0,400 L 1024,400 M 0,500 L 1024,500 M 0,600 L 1024,600 M 0,700 L 1024,700 M 0,800 L 1024,800 M 0,900 L 1024,900" stroke="#FFFFFF" stroke-width="2"/>
            <path d="M 100,0 L 100,1024 M 200,0 L 200,1024 M 300,0 L 300,1024 M 400,0 L 400,1024 M 500,0 L 500,1024 M 600,0 L 600,1024 M 700,0 L 700,1024 M 800,0 L 800,1024 M 900,0 L 900,1024" stroke="#FFFFFF" stroke-width="2"/>
        </g>
        `;
    } else if (decType === "stars") {
        styleDecorations = `
        <path d="M150,150 L160,165 L175,170 L160,175 L150,190 L140,175 L125,170 L140,165 Z" fill="${accentColor}" opacity="0.6" />
        <path d="M850,250 L855,258 L865,260 L855,262 L850,270 L845,262 L835,260 L845,258 Z" fill="${accentColor}" opacity="0.7" />
        <circle cx="200" cy="300" r="4" fill="#FFFFFF" opacity="0.8" />
        <circle cx="800" cy="400" r="6" fill="#FFFFFF" opacity="0.5" />
        <circle cx="300" cy="180" r="3" fill="#FFFFFF" opacity="0.4" />
        <circle cx="700" cy="800" r="5" fill="#FFFFFF" opacity="0.3" />
        `;
    } else if (decType === "leaves") {
        styleDecorations = `
        <path d="M120,200 C150,180 170,210 170,210 C170,210 140,230 120,200 Z" fill="${accentColor}" opacity="0.3" />
        <path d="M880,180 C910,160 930,190 930,190 C930,190 900,210 880,180 Z" fill="${accentColor}" opacity="0.2" />
        <path d="M180,820 C210,800 230,830 230,830 C230,830 200,850 180,820 Z" fill="${accentColor}" opacity="0.25" />
        `;
    } else if (decType === "geometric") {
        styleDecorations = `
        <circle cx="512" cy="512" r="440" stroke="#FFFFFF" stroke-width="1.5" fill="none" opacity="0.1" />
        <circle cx="512" cy="512" r="380" stroke="${primaryColor}" stroke-width="4" stroke-dasharray="20, 10" fill="none" opacity="0.2" />
        <circle cx="512" cy="512" r="320" stroke="${secondaryColor}" stroke-width="2" fill="none" opacity="0.3" />
        `;
    } else if (decType === "digital_rain") {
        styleDecorations = `
        <g fill="${accentColor}" opacity="0.25" font-family="monospace" font-size="20">
            <text x="100" y="150">0</text><text x="100" y="180">1</text><text x="100" y="210">0</text>
            <text x="200" y="250">1</text><text x="200" y="280">0</text>
            <text x="800" y="120">1</text><text x="800" y="150">1</text><text x="800" y="180">0</text>
            <text x="900" y="300">0</text><text x="900" y="330">1</text>
        </g>
        `;
    } else if (decType === "target") {
        styleDecorations = `
        <path d="M80,80 L120,80 M80,80 L80,120" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.3" />
        <path d="M944,80 L904,80 M944,80 L944,120" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.3" />
        <path d="M80,944 L120,944 M80,944 L80,904" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.3" />
        <path d="M944,944 L904,944 M944,944 L944,904" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.3" />
        `;
    }

    const sym = allowedSymbols[val3 % allowedSymbols.length];
    let subjectGraphic = "";

    if (sym === "apple") {
        subjectGraphic = `
        <g transform="translate(512, 530)">
            <path d="M-15, -130 C-90, -135 -145, -75 -145, 10 C-145, 100 -90, 140 -25, 140 C-5, 140 -5, 130 -15, 130 C-25, 130 -25, 120 -15, 120" fill="url(#primaryGrad)" />
            <path d="M15, -130 C90, -135 145, -75 145, 10 C145, 100 90, 140 25, 140 C5, 140 5, 130 15, 130 C25, 130 25, 120 15, 120" fill="url(#primaryGrad)" />
            <path d="M-30, -120 Q0, -100 30, -120 Q45, 10 30, 135 Q0, 150 -30, 135 Q-45, 10 -30, -120 Z" fill="url(#primaryGrad)" />
            <path d="M0, -120 Q10, -170 35, -195" stroke="#78350F" stroke-width="12" stroke-linecap="round" fill="none" />
            <path d="M30, -185 C65, -210 90, -195 90, -195 C90, -195 85, -170 50, -155 C15, -140 30, -185 30, -185 Z" fill="${accentColor}" />
            <path d="M-90, -50 C-120, 0 -120, 50 -90, 80 C-105, 50 -105, 0 -90, -50 Z" fill="#FFFFFF" opacity="0.3" />
        </g>
        <path d="M362,750 C362,630 422,600 512,600 C602,600 662,630 662,750" fill="url(#secondaryGrad)" opacity="0.5" />
        <circle cx="512" cy="480" r="110" fill="url(#secondaryGrad)" opacity="0.6" />
        `;
    } else if (sym === "code") {
        subjectGraphic = `
        <text x="280" y="550" font-family="monospace" font-size="140" font-weight="bold" fill="${accentColor}" opacity="0.25" text-anchor="middle">&lt;</text>
        <text x="744" y="550" font-family="monospace" font-size="140" font-weight="bold" fill="${accentColor}" opacity="0.25" text-anchor="middle">&gt;</text>
        <text x="512" y="320" font-family="monospace" font-size="60" font-weight="bold" fill="${primaryColor}" opacity="0.3" text-anchor="middle">10101</text>
        <path d="M262,820 C262,670 362,640 512,640 C662,640 762,670 762,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="140" fill="url(#secondaryGrad)" />
        <rect x="400" y="420" width="224" height="50" rx="25" fill="${accentColor}" opacity="0.9" filter="url(#glow)" />
        <rect x="420" y="430" width="184" height="30" rx="15" fill="#FFFFFF" opacity="0.4" />
        `;
    } else if (sym === "helmet" || sym === "space_ship") {
        subjectGraphic = `
        <circle cx="512" cy="450" r="200" stroke="${accentColor}" stroke-width="3" fill="none" opacity="0.4" filter="url(#glow)" />
        <path d="M262,820 L362,690 L400,700 L512,650 L624,700 L662,690 L762,820 Z" fill="url(#primaryGrad)" />
        <path d="M420,730 L512,780 L604,730" stroke="#FFFFFF" stroke-width="3" fill="none" opacity="0.3" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <path d="M412,410 L612,410 L632,480 L512,540 L392,480 Z" fill="#1E293B" />
        <path d="M432,430 L592,430 L602,470 L512,510 L422,470 Z" fill="${accentColor}" filter="url(#glow)" />
        `;
    } else if (sym === "mask") {
        subjectGraphic = `
        <circle cx="512" cy="450" r="220" fill="${secondaryColor}" opacity="0.1" />
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="#020617" />
        <path d="M382,410 L642,410 L622,450 L402,450 Z" fill="${primaryColor}" />
        <path d="M382,410 Q320,380 300,430" stroke="${primaryColor}" stroke-width="8" fill="none" stroke-linecap="round" />
        <path d="M442,470 L582,470 L572,490 L452,490 Z" fill="${accentColor}" filter="url(#glow)" />
        `;
    } else if (sym === "wand" || sym === "star") {
        subjectGraphic = `
        <circle cx="512" cy="450" r="210" stroke="${accentColor}" stroke-width="2" stroke-dasharray="10, 15" fill="none" opacity="0.3" filter="url(#glow)" />
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="120" fill="url(#secondaryGrad)" />
        <polygon points="512,180 400,380 624,380" fill="#1E1B4B" />
        <polygon points="512,180 512,380 624,380" fill="${primaryColor}" opacity="0.3" />
        <polygon points="512,240 517,255 532,255 520,265 525,280 512,270 499,280 504,265 492,255 507,255" fill="${accentColor}" />
        `;
    } else if (sym === "leaf") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <g transform="translate(512, 450) scale(1.5)">
            <path d="M-20,-20 C0,-60 40,-40 40,-40 C40,-40 20,0 -20,-20 Z" fill="${accentColor}" />
            <path d="M-20,-20 L20,-30" stroke="#FFFFFF" stroke-width="2" fill="none" />
        </g>
        `;
    } else if (sym === "crown") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <polygon points="412,380 442,430 512,370 582,430 612,380 592,450 432,450" fill="${accentColor}" filter="url(#glow)" />
        <circle cx="512" cy="370" r="6" fill="#FFFFFF" />
        <circle cx="412" cy="380" r="4" fill="#FFFFFF" />
        <circle cx="612" cy="380" r="4" fill="#FFFFFF" />
        `;
    } else if (sym === "gear") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <g transform="translate(512, 450)" fill="${accentColor}">
            <circle cx="0" cy="0" r="50" />
            <circle cx="0" cy="0" r="20" fill="url(#secondaryGrad)" />
            <rect x="-15" y="-65" width="30" height="130" rx="5" />
            <rect x="-65" y="-15" width="130" height="30" rx="5" />
            <g transform="rotate(45)">
                <rect x="-15" y="-65" width="30" height="130" rx="5" />
                <rect x="-65" y="-15" width="130" height="30" rx="5" />
            </g>
        </g>
        `;
    } else if (sym === "shield") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <path d="M452,380 L572,380 L572,430 Q572,490 512,510 Q452,490 452,430 Z" fill="${accentColor}" opacity="0.9" />
        <path d="M472,395 L552,395 L552,430 Q552,475 512,490 Q472,475 472,430 Z" fill="url(#secondaryGrad)" />
        `;
    } else if (sym === "sword") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <g transform="translate(512, 450) stroke-linecap="round" rotate="45)">
            <rect x="-8" y="-70" width="16" height="100" fill="${accentColor}" />
            <polygon points="-8,-70 0,-90 8,-70" fill="${accentColor}" />
            <rect x="-24" y="30" width="48" height="10" fill="#78350F" />
            <rect x="-5" y="40" width="10" height="25" fill="#B45309" />
        </g>
        `;
    } else if (sym === "heart") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <path d="M512,490 C512,490 442,440 442,390 C442,350 472,330 512,370 C552,330 582,350 582,390 C582,440 512,490 512,490 Z" fill="${accentColor}" />
        `;
    } else if (sym === "key") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <g transform="translate(512, 450) rotate(-45)">
            <circle cx="-30" cy="0" r="25" stroke="${accentColor}" stroke-width="8" fill="none" />
            <rect x="-5" y="-4" width="70" height="8" fill="${accentColor}" />
            <rect x="45" y="4" width="8" height="15" fill="${accentColor}" />
            <rect x="57" y="4" width="8" height="15" fill="${accentColor}" />
        </g>
        `;
    } else if (sym === "globe") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <circle cx="512" cy="450" r="70" stroke="${accentColor}" stroke-width="3" fill="none" opacity="0.8" />
        <ellipse cx="512" cy="450" rx="70" ry="25" stroke="${accentColor}" stroke-width="2" fill="none" opacity="0.8" />
        <ellipse cx="512" cy="450" rx="25" ry="70" stroke="${accentColor}" stroke-width="2" fill="none" opacity="0.8" />
        `;
    } else if (sym === "compass") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <circle cx="512" cy="450" r="60" stroke="${accentColor}" stroke-width="4" fill="none" />
        <polygon points="512,395 522,450 512,440 502,450" fill="${accentColor}" />
        <polygon points="512,505 522,450 512,460 502,450" fill="#E2E8F0" />
        `;
    } else if (sym === "flame") {
        subjectGraphic = `
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <path d="M512,360 C512,360 552,400 552,440 C552,480 512,510 512,510 C512,510 472,480 472,440 C472,400 512,360 512,360 Z" fill="${accentColor}" />
        <path d="M512,390 C512,390 537,420 537,445 C537,470 512,490 512,490 C512,490 487,470 487,445 C487,420 512,390 512,390 Z" fill="#F59E0B" />
        `;
    } else {
        subjectGraphic = `
        <circle cx="512" cy="450" r="180" fill="${primaryColor}" opacity="0.15" filter="url(#glow)" />
        <path d="M280,820 C280,680 370,640 512,640 C654,640 744,680 744,820 Z" fill="url(#primaryGrad)" />
        <circle cx="512" cy="450" r="130" fill="url(#secondaryGrad)" />
        <circle cx="492" cy="430" r="110" fill="#FFFFFF" opacity="0.05" />
        <polygon points="512,280 532,320 572,320 540,345 552,385 512,360 472,385 484,345 452,320 492,320" fill="${accentColor}" opacity="0.8" />
        `;
    }

    let styleShapes = "";
    let styleOverlay = "";
    if (style === "3d" || style === "3d render") {
        styleShapes = `<circle cx="512" cy="512" r="320" stroke="${secondaryColor}" stroke-width="2" fill="none" opacity="0.3" />`;
        styleOverlay = `<path d="M512,140 C650,140 760,250 760,388 C760,420 740,300 620,220 C500,140 512,140 512,140 Z" fill="#FFFFFF" opacity="0.15" />`;
    } else if (style === "realistic") {
        styleShapes = `<circle cx="512" cy="512" r="440" stroke="#FFFFFF" stroke-width="1.5" fill="none" opacity="0.1" />`;
    }

    const svg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${bgGradientStart}" />
      <stop offset="100%" stop-color="${bgGradientEnd}" />
    </radialGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
    <linearGradient id="secondaryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${secondaryColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${accentColor}" stop-opacity="0.9" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="1024" height="1024" fill="url(#bgGrad)" />
  ${styleDecorations}
  ${subjectGraphic}
  ${styleShapes}
  ${styleOverlay}
  <rect x="20" y="20" width="984" height="984" rx="20" stroke="${primaryColor}" stroke-width="4" stroke-opacity="0.2" fill="none" />
</svg>`;

    return Buffer.from(svg, 'utf-8');
};
