/**
 * localAI.js — Zero-dependency local AI engine for Infinity.
 *
 * Handles:
 *   1. General chat (smart rule-based responses)
 *   2. Laws AI (dataset lookup + formatted response)
 *   3. PDF content generation (topic-aware structured document)
 *   4. PPT content generation (topic-aware slides)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Laws dataset ─────────────────────────────────────────────────────────────
let lawsData = [];
try {
    const datasetPath = path.join(__dirname, '../data/laws_dataset.json');
    lawsData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
} catch (e) {
    console.warn('[LocalAI] Could not load laws dataset:', e.message);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function tokenize(str) {
    return str.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
}

function overlap(tokensA, tokensB) {
    const setB = new Set(tokensB);
    return tokensA.filter(t => setB.has(t)).length;
}

/** Stable topic hash for deterministic output */
function topicHash(str) {
    return parseInt(crypto.createHash('md5').update(str).digest('hex').slice(0, 8), 16);
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. GENERAL CHAT
// ═══════════════════════════════════════════════════════════════════════════

const CHAT_RULES = [
    {
        match: ['hello', 'hi', 'hey', 'greetings', 'sup'],
        response: () => `Hello! I'm the Infinity AI assistant. I can help you with questions, information, explanations, and more. What would you like to know?`
    },
    {
        match: ['who are you', 'what are you', 'your name', 'introduce yourself'],
        response: () => `I'm the Infinity AI, a built-in assistant for the Infinity platform. I can answer questions, explain concepts, help with research, and more — all without needing an internet connection to an external AI service.`
    },
    {
        match: ['how are you', 'how r u', 'how do you do'],
        response: () => `I'm running perfectly! Ready to help you with whatever you need. What's on your mind?`
    },
    {
        match: ['what can you do', 'help', 'features', 'capabilities'],
        response: () => `I can help you with:\n\n• **Answering questions** on a wide range of topics\n• **Explaining concepts** in simple terms\n• **Indian law information** (try the Laws AI section)\n• **Generating documents** — PDFs and presentations\n• **General knowledge** and research assistance\n\nJust type your question and I'll do my best to help!`
    },
    {
        match: ['bye', 'goodbye', 'see you', 'later', 'quit'],
        response: () => `Goodbye! Come back anytime you need help. Have a great day!`
    },
    {
        match: ['thank', 'thanks', 'thank you', 'thx', 'ty'],
        response: () => `You're welcome! Happy to help. Is there anything else you'd like to know?`
    },
];

const KNOWLEDGE_BASE = [
    {
        tags: ['ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network'],
        answer: `**Artificial Intelligence (AI)** is the simulation of human intelligence by computers.\n\n**Key branches:**\n• Machine Learning — systems that learn from data\n• Deep Learning — neural networks with many layers\n• Natural Language Processing — understanding human language\n• Computer Vision — interpreting visual data\n\n**Real-world uses:** recommendation systems, voice assistants, medical diagnosis, autonomous vehicles, fraud detection.\n\n**How it works:** AI models are trained on large datasets, adjusting internal parameters (weights) to improve accuracy over time.`
    },
    {
        tags: ['python', 'programming language', 'coding python'],
        answer: `**Python** is a high-level, general-purpose programming language known for simplicity and readability.\n\n**Key features:**\n• Easy to learn — clean, English-like syntax\n• Versatile — web, data science, AI, automation, scripting\n• Massive ecosystem — pip packages (NumPy, Pandas, Flask, Django, TensorFlow)\n• Interpreted — runs code line by line\n\n**Common uses:** data analysis, web backends, machine learning, automation scripts, scientific computing.\n\n**Tip:** Start with official docs at python.org`
    },
    {
        tags: ['javascript', 'js', 'node', 'nodejs', 'react', 'frontend'],
        answer: `**JavaScript** is the programming language of the web, running in every browser.\n\n**Key facts:**\n• Originally browser-only, now runs on servers via Node.js\n• React, Vue, Angular — popular frontend frameworks\n• Async programming with Promises and async/await\n• npm ecosystem has millions of packages\n\n**Node.js** lets you run JavaScript on the server side — great for APIs, real-time apps, and microservices.\n\n**React** is a component-based UI library by Meta — this very project is built with it!`
    },
    {
        tags: ['blockchain', 'crypto', 'bitcoin', 'ethereum', 'nft', 'web3'],
        answer: `**Blockchain** is a distributed ledger technology where data is stored in linked, cryptographically secured blocks.\n\n**Key concepts:**\n• Decentralized — no single authority controls it\n• Immutable — records cannot be altered once added\n• Consensus mechanisms — Proof of Work (Bitcoin), Proof of Stake (Ethereum)\n• Smart contracts — self-executing code on the blockchain\n\n**Cryptocurrencies** are digital currencies that run on blockchains.\n\n**NFTs** (Non-Fungible Tokens) are unique digital assets verified on a blockchain.`
    },
    {
        tags: ['cloud', 'aws', 'azure', 'gcp', 'cloud computing', 'server'],
        answer: `**Cloud Computing** delivers computing services (servers, storage, databases, networking, software) over the internet.\n\n**Major providers:**\n• AWS (Amazon Web Services) — market leader, 200+ services\n• Microsoft Azure — strong enterprise integration\n• Google Cloud Platform — excellent for AI/ML workloads\n\n**Service models:**\n• IaaS — Infrastructure as a Service (virtual machines)\n• PaaS — Platform as a Service (managed runtimes)\n• SaaS — Software as a Service (Gmail, Salesforce)\n\n**Benefits:** scalability, pay-as-you-go pricing, global reach, high availability.`
    },
    {
        tags: ['database', 'sql', 'mysql', 'mongodb', 'nosql', 'postgres'],
        answer: `**Databases** store and organize data for efficient retrieval and manipulation.\n\n**SQL (Relational) databases:**\n• Data in tables with rows and columns\n• Strong consistency, ACID transactions\n• Examples: MySQL, PostgreSQL, SQLite\n\n**NoSQL databases:**\n• Flexible schemas, horizontal scaling\n• Types: Document (MongoDB), Key-Value (Redis), Graph (Neo4j), Column (Cassandra)\n• Great for unstructured or rapidly changing data\n\n**When to use which?** SQL for structured financial/transactional data; NoSQL for flexible, large-scale web apps.`
    },
    {
        tags: ['cybersecurity', 'security', 'hacking', 'encryption', 'firewall', 'vulnerability'],
        answer: `**Cybersecurity** protects computer systems, networks, and data from digital attacks.\n\n**Key concepts:**\n• Encryption — converting data into unreadable format (AES, RSA)\n• Firewall — monitors and controls network traffic\n• Authentication — verifying identity (passwords, MFA, biometrics)\n• Penetration Testing — ethical hacking to find vulnerabilities\n\n**Common threats:**\n• Phishing — deceptive emails/sites stealing credentials\n• Ransomware — malware that encrypts files for ransom\n• SQL Injection — inserting malicious SQL into inputs\n• XSS — injecting scripts into web pages\n\n**Best practices:** strong passwords, MFA, regular updates, input validation.`
    },
    {
        tags: ['startup', 'business', 'entrepreneur', 'company', 'funding', 'venture'],
        answer: `**Starting a startup** requires vision, execution, and adaptability.\n\n**Key phases:**\n1. Idea validation — talk to potential customers, find a real problem\n2. MVP (Minimum Viable Product) — build the simplest working version\n3. Product-market fit — do people actually pay/use it?\n4. Growth — scale what works\n5. Funding — bootstrapping, angel investors, VCs (Seed → Series A → B)\n\n**Key metrics to track:**\n• MAU/DAU — Monthly/Daily Active Users\n• CAC — Customer Acquisition Cost\n• LTV — Lifetime Value\n• Churn rate — how many users leave\n\n**Indian startup ecosystem:** IIT/IIM networks, Y Combinator India, Sequoia Surge, Accel, Blume Ventures.`
    },
    {
        tags: ['india', 'indian history', 'constitution', 'government', 'democracy'],
        answer: `**India** is the world's largest democracy with a rich history spanning thousands of years.\n\n**Key facts:**\n• Population: ~1.4 billion (most populous country)\n• Capital: New Delhi\n• Government: Federal parliamentary republic\n• Constitution: Adopted January 26, 1950\n• Languages: 22 scheduled languages; Hindi and English official\n\n**Constitutional highlights:**\n• Fundamental Rights (Part III)\n• Directive Principles of State Policy (Part IV)\n• Separation of powers: Legislature, Executive, Judiciary\n• Independent Supreme Court with judicial review powers`
    },
    {
        tags: ['states', 'state', 'union territory', 'ut', 'states of india', 'indian states', 'india'],
        answer: `## States and Union Territories of India\n\nIndia has **28 states** and **8 union territories** (as of 2026).\n\n### 28 States\n1. Andhra Pradesh\n2. Arunachal Pradesh\n3. Assam\n4. Bihar\n5. Chhattisgarh\n6. Goa\n7. Gujarat\n8. Haryana\n9. Himachal Pradesh\n10. Jharkhand\n11. Karnataka\n12. Kerala\n13. Madhya Pradesh\n14. Maharashtra\n15. Manipur\n16. Meghalaya\n17. Mizoram\n18. Nagaland\n19. Odisha\n20. Punjab\n21. Rajasthan\n22. Sikkim\n23. Tamil Nadu\n24. Telangana\n25. Tripura\n26. Uttar Pradesh\n27. Uttarakhand\n28. West Bengal\n\n### 8 Union Territories\n• Andaman and Nicobar Islands\n• Chandigarh\n• Dadra and Nagar Haveli and Daman and Diu\n• Delhi (National Capital Territory)\n• Jammu and Kashmir\n• Ladakh\n• Lakshadweep\n• Puducherry\n\n## Key Takeaways\n• India is a federal union of states and union territories\n• States have their own elected governments; UTs are administered by the Centre (with exceptions like Delhi and Puducherry)\n• Telangana was the most recent major state formed (2014)\n• Ladakh was created as a UT after J&K reorganisation in 2019`
    },
    {
        tags: ['climate', 'environment', 'global warming', 'carbon', 'renewable', 'energy'],
        answer: `**Climate Change** refers to long-term shifts in global temperatures and weather patterns.\n\n**Key facts:**\n• Primary cause: greenhouse gas emissions (CO₂, methane) from human activity\n• Global temperature has risen ~1.1°C since pre-industrial levels\n• Effects: rising sea levels, extreme weather, biodiversity loss\n\n**Solutions:**\n• Renewable energy — solar, wind, hydro replacing fossil fuels\n• Electric vehicles reducing transport emissions\n• Carbon capture technology\n• Reforestation and sustainable land use\n\n**Paris Agreement:** 195 countries committed to limit warming to 1.5–2°C.`
    },
    {
        tags: ['health', 'medicine', 'disease', 'doctor', 'hospital', 'fitness', 'nutrition'],
        answer: `**Health** encompasses physical, mental, and social well-being.\n\n**Pillars of good health:**\n• Sleep — 7-9 hours for adults is optimal\n• Nutrition — balanced diet: proteins, complex carbs, healthy fats, vitamins\n• Exercise — 150 min moderate aerobic activity per week\n• Mental health — stress management, social connections, mindfulness\n• Preventive care — regular checkups, vaccinations\n\n**Important note:** For specific medical conditions, always consult a qualified doctor. This is general health information only.`
    },
];

export function generalChat(message) {
    const lower = message.toLowerCase();
    const tokens = tokenize(message);

    // 1. Check conversational rules
    for (const rule of CHAT_RULES) {
        if (rule.match.some(m => lower.includes(m))) {
            return rule.response();
        }
    }

    // 2. Check knowledge base
    let bestMatch = null;
    let bestScore = 0;
    for (const entry of KNOWLEDGE_BASE) {
        const score = overlap(tokens, entry.tags);
        if (score > bestScore) {
            bestScore = score;
            bestMatch = entry;
        }
    }
    if (bestScore >= 1 && bestMatch) {
        return bestMatch.answer;
    }

    // 3. Intelligent fallback with the question echoed back meaningfully
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'explain', 'define', 'tell me'];
    const isQuestion = questionWords.some(w => lower.startsWith(w) || lower.includes(w));

    if (isQuestion) {
        return `I understand you're asking about: **"${message}"**\n\nI'm a local AI engine without external internet access, so I may not have specific data on this exact topic. Here's what I can suggest:\n\n• Try rephrasing with keywords like "explain", "what is", or specific topic names\n• For Indian law queries, use the **Laws AI** section\n• For document creation, use the **Create** section\n• Check the **Search** feature for web-based answers\n\nI'm continuously being improved. What else can I help you with?`;
    }

    return `You said: **"${message}"**\n\nI'm here to help! Try asking me about technology, AI, programming, business, health, climate, or Indian law. You can also use specific keywords to get better responses.\n\nWhat would you like to explore?`;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. LAWS AI
// ═══════════════════════════════════════════════════════════════════════════

export function lawsChat(message) {
    const tokens = tokenize(message);
    const lower = message.toLowerCase();

    // Score each law against the query
    const scored = lawsData.map(law => {
        let score = 0;
        const kwTokens = (law.keywords || []).map(k => k.toLowerCase());
        const titleTokens = tokenize(law.title || '');
        const descTokens = tokenize(law.description || '');

        score += overlap(tokens, kwTokens) * 3;
        score += overlap(tokens, titleTokens) * 4;
        score += overlap(tokens, descTokens) * 1;

        // Exact category match bonus
        if (law.category && lower.includes(law.category.toLowerCase())) score += 5;

        return { law, score };
    }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);

    if (scored.length === 0) {
        return `I couldn't find a specific Indian law matching your query.\n\n**Suggestions:**\n• Try keywords like "theft", "assault", "fraud", "rape", "murder", "cybercrime", "drugs"\n• Browse the **Laws** section for a full categorized list\n\n**[NOTE]**\nThis is not legal advice. Always consult a qualified lawyer for legal matters.`;
    }

    let response = `Based on your query, here are the most relevant Indian laws:\n\n`;

    scored.forEach(({ law }) => {
        const pType = Array.isArray(law.punishment?.type) ? law.punishment.type.join(', ') : (law.punishment?.type || 'Varies');
        const pDuration = law.punishment?.duration || '';
        const punishment = [pType, pDuration].filter(Boolean).join(' — ');

        response += `**[LAW]** ${law.law}\n`;
        response += `**[SECTION]** Section ${law.section} — ${law.title}\n`;
        response += `**[EXPLANATION]** ${law.description}\n`;
        response += `**[PUNISHMENT]** ${punishment}\n`;
        response += `**[COURT]** ${law.triable_by || 'As per jurisdiction'} | Bailable: ${law.bailable ? 'Yes' : 'No'} | Cognizable: ${law.cognizable ? 'Yes' : 'No'}\n`;
        response += `\n---\n\n`;
    });

    response += `**[NOTE]** This is educational information only and does not constitute legal advice. Please consult a qualified advocate for your specific situation.`;
    return response;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. PDF / DOCUMENT GENERATION
// ═══════════════════════════════════════════════════════════════════════════

const SECTION_TEMPLATES = {
    intro: (topic) => ({
        sectionTitle: '1. Introduction & Overview',
        subsections: [{
            subsectionTitle: `What is ${topic}?`,
            paragraphs: [
                `${topic} is a significant area of study that has gained considerable attention in recent years. Understanding its fundamentals is essential for anyone looking to engage with this subject at a professional or academic level.`,
                `This document provides a structured overview of ${topic}, covering its core principles, real-world applications, current trends, and future directions. The information presented here is intended to serve as a comprehensive reference guide.`
            ]
        }, {
            subsectionTitle: 'Historical Background',
            paragraphs: [
                `The origins of ${topic} can be traced through several decades of development and refinement. Early pioneers established the foundational frameworks that continue to shape the field today.`,
                `Over time, ${topic} has evolved significantly, driven by technological advances, changing societal needs, and the contributions of researchers and practitioners worldwide.`
            ]
        }]
    }),
    core: (topic) => ({
        sectionTitle: '2. Core Concepts & Principles',
        subsections: [{
            subsectionTitle: 'Fundamental Framework',
            paragraphs: [
                `At its core, ${topic} is built upon a set of interrelated principles that work together to create a coherent and functional system. These principles provide the theoretical foundation for all practical applications.`,
                `Understanding these fundamentals allows practitioners to make informed decisions, solve complex problems, and innovate within the domain of ${topic}.`
            ],
            table: {
                headers: ['Concept', 'Description', 'Importance'],
                rows: [
                    ['Core Principle 1', `Foundational element of ${topic}`, 'Critical'],
                    ['Core Principle 2', 'Supporting framework and methodology', 'High'],
                    ['Core Principle 3', 'Implementation guidelines and standards', 'Medium'],
                    ['Core Principle 4', 'Evaluation and measurement criteria', 'High'],
                ]
            }
        }]
    }),
    applications: (topic) => ({
        sectionTitle: '3. Applications & Use Cases',
        subsections: [{
            subsectionTitle: 'Real-World Applications',
            paragraphs: [
                `${topic} finds application across a diverse range of industries and sectors. Its versatility makes it particularly valuable in contexts where systematic approaches and evidence-based decision-making are required.`,
                `Leading organizations globally have adopted ${topic} as a strategic priority, recognizing its potential to drive efficiency, innovation, and competitive advantage.`
            ],
            chart: {
                type: 'bar',
                data: [
                    { label: 'Industry A', value: 75 },
                    { label: 'Industry B', value: 60 },
                    { label: 'Industry C', value: 85 },
                    { label: 'Industry D', value: 45 },
                ]
            }
        }]
    }),
    challenges: (topic) => ({
        sectionTitle: '4. Challenges & Considerations',
        subsections: [{
            subsectionTitle: 'Key Challenges',
            paragraphs: [
                `Despite its many benefits, ${topic} presents several challenges that practitioners must navigate carefully. These range from technical complexities to organizational and ethical considerations.`,
                `Addressing these challenges requires a multi-faceted approach that combines technical expertise, strategic planning, and stakeholder engagement.`
            ],
            table: {
                headers: ['Challenge', 'Impact Level', 'Mitigation Strategy'],
                rows: [
                    ['Resource constraints', 'High', 'Phased implementation approach'],
                    ['Skill gaps', 'Medium', 'Training and capacity building'],
                    ['Integration complexity', 'High', 'Modular architecture design'],
                    ['Stakeholder alignment', 'Medium', 'Communication and change management'],
                ]
            }
        }]
    }),
    future: (topic) => ({
        sectionTitle: '5. Future Outlook & Recommendations',
        subsections: [{
            subsectionTitle: 'Emerging Trends',
            paragraphs: [
                `The future of ${topic} looks promising, with several emerging trends set to reshape the landscape in the coming years. Technological advancement, increasing adoption, and growing sophistication of applications are key drivers.`,
                `Organizations that invest in understanding and adapting to these trends will be well-positioned to leverage ${topic} for sustained competitive advantage and innovation.`
            ]
        }, {
            subsectionTitle: 'Strategic Recommendations',
            paragraphs: [
                `Based on the analysis presented in this document, we recommend a structured approach to engaging with ${topic}. Begin with a thorough assessment of current capabilities and identify specific areas where ${topic} can deliver the greatest value.`,
                `Establish clear metrics for success, build cross-functional teams with the right mix of skills, and adopt an iterative approach that allows for learning and adjustment along the way.`
            ]
        }]
    })
};

export function generatePdfContent(topic) {
    const cleanTopic = (topic || 'Technology Overview').trim();
    const h = topicHash(cleanTopic);

    const themes = ['Modern Blue', 'Forest Green', 'Dark Mode Minimalist', 'Warm Terracotta', 'Vibrant Sunset'];
    const docTypes = ['Research Paper', 'Project Report', 'Whitepaper', 'Business Report', 'Technical Documentation'];

    return {
        documentTitle: cleanTopic,
        documentType: docTypes[h % docTypes.length],
        theme: themes[h % themes.length],
        executiveSummary: `This document provides a comprehensive analysis of ${cleanTopic}. It covers the fundamental concepts, practical applications, current challenges, and future directions. The report is structured to serve both as an introduction for newcomers and as a reference for those already familiar with the subject. Key findings indicate that ${cleanTopic} represents a significant opportunity for organizations willing to invest in understanding and implementing its principles.`,
        tableOfContents: [
            '1. Introduction & Overview',
            '2. Core Concepts & Principles',
            '3. Applications & Use Cases',
            '4. Challenges & Considerations',
            '5. Future Outlook & Recommendations',
        ],
        sections: [
            SECTION_TEMPLATES.intro(cleanTopic),
            SECTION_TEMPLATES.core(cleanTopic),
            SECTION_TEMPLATES.applications(cleanTopic),
            SECTION_TEMPLATES.challenges(cleanTopic),
            SECTION_TEMPLATES.future(cleanTopic),
        ],
        references: [
            `${cleanTopic}: Principles and Practice. Academic Press, 2024.`,
            `Global Industry Report on ${cleanTopic}. Market Research Institute, 2025.`,
            `Understanding ${cleanTopic}: A Practitioner\'s Guide. Professional Standards Board.`,
            `Emerging Trends in ${cleanTopic}. Technology Futures Quarterly, Vol. 12.`,
        ]
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. PPT / PRESENTATION GENERATION
// ═══════════════════════════════════════════════════════════════════════════

export function generatePptContent(topic) {
    const cleanTopic = (topic || 'Overview').trim();
    const h = topicHash(cleanTopic);

    const themes = ['Modern Blue', 'Forest Green', 'Dark Mode Minimalist', 'Warm Terracotta', 'Vibrant Sunset'];

    const slides = [
        {
            slideNumber: 1,
            type: 'Title Slide',
            title: cleanTopic,
            subtitle: 'A Comprehensive Overview',
            content: [],
            speakerNotes: `Welcome. Today's presentation covers ${cleanTopic} in depth.`,
            imagePrompt: `Professional title cover for ${cleanTopic}`,
            chartType: ''
        },
        {
            slideNumber: 2,
            type: 'Content Slide',
            title: 'Introduction & Context',
            subtitle: 'Setting the Foundation',
            content: [
                `${cleanTopic} is a rapidly evolving field with broad impact`,
                'Historical roots trace back to decades of research and practice',
                'Global adoption is accelerating across key sectors',
                'Driven by technological advancement and changing needs',
                'Understanding context is essential for effective application'
            ],
            speakerNotes: `This slide establishes the context for our exploration of ${cleanTopic}.`,
            imagePrompt: `Conceptual diagram representing ${cleanTopic}`,
            chartType: ''
        },
        {
            slideNumber: 3,
            type: 'Two Column',
            title: 'Core Principles',
            subtitle: 'Foundational Framework',
            content: [
                'Principle 1: Systematic and structured approach',
                'Principle 2: Data-driven decision making',
                'Principle 3: Iterative improvement cycle',
                'Principle 4: Stakeholder alignment',
                'Principle 5: Measurable outcomes',
            ],
            speakerNotes: 'These principles underpin all aspects of the subject.',
            imagePrompt: `Framework diagram for ${cleanTopic}`,
            chartType: ''
        },
        {
            slideNumber: 4,
            type: 'Image Left',
            title: 'Key Applications',
            subtitle: 'Real-World Impact',
            content: [
                'Enterprise adoption driving operational efficiency',
                'Consumer-facing products leveraging core capabilities',
                'Research institutions advancing theoretical foundations',
                'Government and public sector implementations',
                'Cross-industry collaboration and knowledge transfer'
            ],
            speakerNotes: 'Real-world applications demonstrate the practical value.',
            imagePrompt: `Global applications of ${cleanTopic}`,
            chartType: ''
        },
        {
            slideNumber: 5,
            type: 'Chart Slide',
            title: 'Market Adoption & Growth',
            subtitle: 'Data-Driven Insights',
            content: [
                'Sector A leading adoption at 75%',
                'Sector B showing rapid 60% growth',
                'Sector C emerging with 85% potential',
                'Sector D in early adoption at 45%',
            ],
            speakerNotes: 'The chart shows adoption distribution across key sectors.',
            imagePrompt: `Growth chart for ${cleanTopic}`,
            chartType: 'bar'
        },
        {
            slideNumber: 6,
            type: 'Comparison',
            title: 'Strengths vs Challenges',
            subtitle: 'Strategic Assessment',
            content: [
                'High efficiency and productivity gains',
                'Scalable across different contexts',
                'Proven frameworks and methodologies',
                'High initial investment required',
                'Expertise and talent gaps exist',
                'Integration with legacy systems is complex',
            ],
            speakerNotes: 'Understanding both sides helps in planning realistic implementations.',
            imagePrompt: `Balance of strengths and challenges for ${cleanTopic}`,
            chartType: ''
        },
        {
            slideNumber: 7,
            type: 'Timeline',
            title: 'Implementation Roadmap',
            subtitle: 'Path to Success',
            content: [
                'Phase 1: Assessment and planning',
                'Phase 2: Pilot implementation',
                'Phase 3: Evaluation and refinement',
                'Phase 4: Full-scale deployment',
            ],
            speakerNotes: 'A phased approach reduces risk and enables learning.',
            imagePrompt: `Roadmap for ${cleanTopic} implementation`,
            chartType: ''
        },
        {
            slideNumber: 8,
            type: 'Content Slide',
            title: 'Future Trends',
            subtitle: 'What Lies Ahead',
            content: [
                'Integration with emerging technologies',
                'Increased automation and intelligence',
                'Democratization of tools and access',
                'Stronger governance and ethical frameworks',
                'Global standardization initiatives underway'
            ],
            speakerNotes: 'Staying ahead of trends is critical for sustained success.',
            imagePrompt: `Future vision for ${cleanTopic}`,
            chartType: ''
        },
        {
            slideNumber: 9,
            type: 'Content Slide',
            title: 'Key Takeaways',
            subtitle: 'Summary',
            content: [
                `${cleanTopic} offers significant strategic value`,
                'A structured, phased approach reduces implementation risk',
                'Data-driven decisions lead to better outcomes',
                'Continuous learning and adaptation are essential',
                'Start small, prove value, then scale'
            ],
            speakerNotes: 'These takeaways summarize the most important insights.',
            imagePrompt: `Key insights from ${cleanTopic}`,
            chartType: ''
        },
        {
            slideNumber: 10,
            type: 'Conclusion Slide',
            title: 'Thank You',
            subtitle: 'Questions & Discussion',
            content: [
                'Open floor for questions',
                'Resources available upon request',
            ],
            speakerNotes: 'Thank the audience and open for Q&A.',
            imagePrompt: `Thank you slide for ${cleanTopic} presentation`,
            chartType: ''
        }
    ];

    return {
        presentationTitle: cleanTopic,
        theme: themes[h % themes.length],
        slides
    };
}
