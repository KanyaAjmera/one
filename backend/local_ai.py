"""
local_ai.py — Zero-dependency local AI engine for the Python backend.
Handles: general Q&A, laws AI, PDF content, PPT content, avatar prompt enhancement.
"""

import json
import hashlib
import os
import re

# ── Load laws dataset ─────────────────────────────────────────────────────────
_laws_data = []
_laws_path = os.path.join(os.path.dirname(__file__), '..', 'node-backend', 'data', 'laws_dataset.json')
try:
    with open(os.path.abspath(_laws_path), 'r', encoding='utf-8') as f:
        _laws_data = json.load(f)
except Exception as e:
    print(f"[LocalAI] Could not load laws dataset: {e}")

# ── Helpers ───────────────────────────────────────────────────────────────────
def _tokenize(text: str):
    return re.sub(r'[^a-z0-9\s]', ' ', text.lower()).split()

def _overlap(a, b):
    sb = set(b)
    return sum(1 for t in a if t in sb)

def _topic_hash(topic: str) -> int:
    return int(hashlib.md5(topic.encode()).hexdigest()[:8], 16)

# ═══════════════════════════════════════════════════════════════════════════
# 1. GENERAL CHAT
# ═══════════════════════════════════════════════════════════════════════════

_KNOWLEDGE = [
    {"tags": ["ai","artificial intelligence","machine learning","deep learning","neural"],
     "answer": "**Artificial Intelligence (AI)** simulates human intelligence in computers.\n\n**Key branches:**\n• Machine Learning — learning from data\n• Deep Learning — multi-layer neural networks\n• NLP — understanding human language\n• Computer Vision — interpreting images\n\n**Uses:** recommendation systems, voice assistants, medical diagnosis, autonomous vehicles."},
    {"tags": ["python","programming","coding"],
     "answer": "**Python** is a high-level general-purpose language known for readability.\n\n**Strengths:** simple syntax, massive ecosystem (NumPy, Pandas, TensorFlow, Django), great for AI/ML, web, automation.\n\n**Tip:** Start at python.org"},
    {"tags": ["javascript","js","nodejs","react","frontend","web"],
     "answer": "**JavaScript** is the language of the web. **Node.js** runs JS on servers. **React** is a component-based UI library.\n\n**Ecosystem:** npm has millions of packages. Async/await makes async code clean."},
    {"tags": ["blockchain","crypto","bitcoin","ethereum","nft","web3"],
     "answer": "**Blockchain** is a distributed, immutable ledger secured by cryptography.\n\n**Key concepts:** decentralization, smart contracts, consensus mechanisms (PoW, PoS).\n\n**Cryptocurrencies** are digital currencies on blockchains. **NFTs** are unique digital assets."},
    {"tags": ["cloud","aws","azure","gcp","server","hosting"],
     "answer": "**Cloud Computing** delivers IT resources over the internet.\n\n**Big 3:** AWS (market leader), Azure (enterprise), GCP (AI/ML).\n\n**Models:** IaaS, PaaS, SaaS.\n\n**Benefits:** scalability, pay-as-you-go, global reach."},
    {"tags": ["database","sql","mysql","mongodb","nosql","postgres"],
     "answer": "**Databases** store and organize data.\n\n**SQL (Relational):** tables, ACID transactions — MySQL, PostgreSQL, SQLite.\n\n**NoSQL:** flexible schemas, horizontal scale — MongoDB, Redis, Cassandra."},
    {"tags": ["security","cybersecurity","hacking","encryption","firewall"],
     "answer": "**Cybersecurity** protects systems from digital attacks.\n\n**Common threats:** phishing, ransomware, SQL injection, XSS.\n\n**Best practices:** strong passwords, MFA, input validation, regular updates."},
    {"tags": ["startup","business","entrepreneur","funding","venture"],
     "answer": "**Building a startup:**\n1. Validate the idea with real customers\n2. Build an MVP\n3. Find product-market fit\n4. Scale what works\n5. Raise funding (Seed → Series A → B)\n\n**Key metrics:** MAU, CAC, LTV, churn rate."},
    {"tags": ["india","constitution","government","democracy","rights"],
     "answer": "**India** is the world's largest democracy.\n\n• Population: ~1.4 billion\n• Federal parliamentary republic\n• Constitution adopted January 26, 1950\n• Fundamental Rights (Part III), DPSPs (Part IV)\n• Supreme Court with judicial review powers"},
    {"tags": ["climate","environment","global warming","renewable","energy","carbon"],
     "answer": "**Climate Change:** global temperatures rising due to greenhouse gas emissions.\n\n**Effects:** rising sea levels, extreme weather, biodiversity loss.\n\n**Solutions:** renewable energy (solar, wind), electric vehicles, carbon capture, reforestation.\n\n**Paris Agreement:** limit warming to 1.5–2°C."},
]

_CHAT_RULES = [
    (["hello","hi","hey","greetings"], "Hello! I'm the Infinity AI assistant. What would you like to know?"),
    (["who are you","what are you","your name"], "I'm the Infinity AI — a built-in assistant that works completely offline. I can answer questions, help with Indian law, and generate documents."),
    (["how are you","how r u"], "Running perfectly! What can I help you with?"),
    (["what can you do","help","features"], "I can help with:\n• Answering questions on tech, science, business, health\n• Indian law information (try Laws AI)\n• Generating PDFs and presentations\n• General knowledge"),
    (["bye","goodbye","see you"], "Goodbye! Come back anytime."),
    (["thank","thanks","thank you","thx"], "You're welcome! Anything else I can help with?"),
]

def general_chat(message: str) -> str:
    lower = message.lower()
    tokens = _tokenize(message)

    for keywords, response in _CHAT_RULES:
        if any(k in lower for k in keywords):
            return response

    best_score = 0
    best_answer = None
    for entry in _KNOWLEDGE:
        score = _overlap(tokens, entry["tags"])
        if score > best_score:
            best_score = score
            best_answer = entry["answer"]

    if best_score >= 1 and best_answer:
        return best_answer

    question_words = ["what","how","why","when","where","who","which","explain","define"]
    if any(message.lower().startswith(w) or w in lower for w in question_words):
        return f'I understand you\'re asking about: **"{message}"**\n\nI\'m a local AI engine. For best results, try keywords like "explain AI", "what is Python", "Indian law theft" etc.\n\nFor web search, use the Search feature. For documents, use the Create section.'

    return f'You said: **"{message}"**\n\nTry asking about technology, AI, programming, business, Indian law, or health topics!'

# ═══════════════════════════════════════════════════════════════════════════
# 2. LAWS AI
# ═══════════════════════════════════════════════════════════════════════════

def laws_chat(query: str) -> str:
    tokens = _tokenize(query)
    lower = query.lower()

    scored = []
    for law in _laws_data:
        score = 0
        score += _overlap(tokens, [k.lower() for k in law.get("keywords", [])]) * 3
        score += _overlap(tokens, _tokenize(law.get("title", ""))) * 4
        score += _overlap(tokens, _tokenize(law.get("description", ""))) * 1
        if law.get("category") and law["category"].lower() in lower:
            score += 5
        if score > 0:
            scored.append((score, law))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = [law for _, law in scored[:3]]

    if not top:
        return ("I couldn't find a specific Indian law matching your query.\n\n"
                "**Try keywords like:** theft, assault, fraud, rape, murder, cybercrime, drugs\n\n"
                "Browse the **Laws** section for the full categorized list.\n\n"
                "**[NOTE]** This is not legal advice.")

    response = "Based on your query, here are the most relevant Indian laws:\n\n"
    for law in top:
        p = law.get("punishment", {})
        p_type = ", ".join(p.get("type", [])) if isinstance(p.get("type"), list) else str(p.get("type", "Varies"))
        p_dur = p.get("duration", "")
        punishment = f"{p_type} — {p_dur}".strip(" —")
        response += f"**[LAW]** {law.get('law','')}\n"
        response += f"**[SECTION]** Section {law.get('section','')} — {law.get('title','')}\n"
        response += f"**[EXPLANATION]** {law.get('description','')}\n"
        response += f"**[PUNISHMENT]** {punishment}\n"
        response += f"**[COURT]** {law.get('triable_by','As per jurisdiction')} | "
        response += f"Bailable: {'Yes' if law.get('bailable') else 'No'} | "
        response += f"Cognizable: {'Yes' if law.get('cognizable') else 'No'}\n\n---\n\n"

    response += "**[NOTE]** Educational information only — not legal advice. Consult a qualified advocate."
    return response

# ═══════════════════════════════════════════════════════════════════════════
# 3. PDF CONTENT GENERATION
# ═══════════════════════════════════════════════════════════════════════════

def generate_pdf_content(topic: str) -> dict:
    t = (topic or "Technology Overview").strip()
    h = _topic_hash(t)
    themes = ["Modern Blue","Forest Green","Dark Mode Minimalist","Warm Terracotta","Vibrant Sunset"]
    doc_types = ["Research Paper","Project Report","Whitepaper","Business Report","Technical Documentation"]

    return {
        "documentTitle": t,
        "documentType": doc_types[h % len(doc_types)],
        "theme": themes[h % len(themes)],
        "executiveSummary": (
            f"This document provides a comprehensive analysis of {t}. "
            f"It covers fundamental concepts, practical applications, current challenges, and future directions. "
            f"Key findings indicate that {t} represents a significant opportunity for organizations "
            f"willing to invest in understanding and implementing its principles."
        ),
        "tableOfContents": [
            "1. Introduction & Overview",
            "2. Core Concepts & Principles",
            "3. Applications & Use Cases",
            "4. Challenges & Considerations",
            "5. Future Outlook & Recommendations",
        ],
        "sections": [
            {
                "sectionTitle": "1. Introduction & Overview",
                "subsections": [
                    {
                        "subsectionTitle": f"What is {t}?",
                        "paragraphs": [
                            f"{t} is a significant area that has gained considerable attention in recent years. "
                            f"Understanding its fundamentals is essential for anyone looking to engage with this subject professionally or academically.",
                            f"This document provides a structured overview covering core principles, real-world applications, "
                            f"current trends, and future directions as a comprehensive reference guide."
                        ]
                    },
                    {
                        "subsectionTitle": "Historical Background",
                        "paragraphs": [
                            f"The origins of {t} can be traced through several decades of development and refinement. "
                            f"Early pioneers established foundational frameworks that continue to shape the field today.",
                            f"Over time, {t} has evolved significantly, driven by technological advances, "
                            f"changing societal needs, and contributions of researchers and practitioners worldwide."
                        ]
                    }
                ]
            },
            {
                "sectionTitle": "2. Core Concepts & Principles",
                "subsections": [
                    {
                        "subsectionTitle": "Fundamental Framework",
                        "paragraphs": [
                            f"At its core, {t} is built upon interrelated principles that work together to create a coherent system. "
                            f"These principles provide the theoretical foundation for all practical applications.",
                            f"Understanding these fundamentals allows practitioners to make informed decisions and innovate within the domain of {t}."
                        ],
                        "table": {
                            "headers": ["Concept", "Description", "Importance"],
                            "rows": [
                                ["Core Principle 1", f"Foundational element of {t}", "Critical"],
                                ["Core Principle 2", "Supporting framework and methodology", "High"],
                                ["Core Principle 3", "Implementation guidelines and standards", "Medium"],
                                ["Core Principle 4", "Evaluation and measurement criteria", "High"],
                            ]
                        }
                    }
                ]
            },
            {
                "sectionTitle": "3. Applications & Use Cases",
                "subsections": [
                    {
                        "subsectionTitle": "Real-World Applications",
                        "paragraphs": [
                            f"{t} finds application across diverse industries. Its versatility makes it valuable "
                            f"in contexts where systematic approaches and evidence-based decisions are required.",
                            f"Leading organizations globally have adopted {t} as a strategic priority, "
                            f"recognizing its potential to drive efficiency, innovation, and competitive advantage."
                        ],
                        "chart": {
                            "type": "bar",
                            "data": [
                                {"label": "Industry A", "value": 75},
                                {"label": "Industry B", "value": 60},
                                {"label": "Industry C", "value": 85},
                                {"label": "Industry D", "value": 45},
                            ]
                        }
                    }
                ]
            },
            {
                "sectionTitle": "4. Challenges & Considerations",
                "subsections": [
                    {
                        "subsectionTitle": "Key Challenges",
                        "paragraphs": [
                            f"Despite its benefits, {t} presents challenges that practitioners must navigate carefully. "
                            f"These range from technical complexities to organizational and ethical considerations.",
                            "Addressing these challenges requires a multi-faceted approach combining technical expertise and strategic planning."
                        ],
                        "table": {
                            "headers": ["Challenge", "Impact Level", "Mitigation Strategy"],
                            "rows": [
                                ["Resource constraints", "High", "Phased implementation"],
                                ["Skill gaps", "Medium", "Training and capacity building"],
                                ["Integration complexity", "High", "Modular architecture design"],
                                ["Stakeholder alignment", "Medium", "Communication and change management"],
                            ]
                        }
                    }
                ]
            },
            {
                "sectionTitle": "5. Future Outlook & Recommendations",
                "subsections": [
                    {
                        "subsectionTitle": "Emerging Trends",
                        "paragraphs": [
                            f"The future of {t} looks promising, with emerging trends set to reshape the landscape. "
                            f"Technological advancement, increasing adoption, and growing sophistication are key drivers.",
                            f"Organizations that invest in adapting to these trends will be well-positioned to leverage {t} for sustained competitive advantage."
                        ]
                    },
                    {
                        "subsectionTitle": "Strategic Recommendations",
                        "paragraphs": [
                            f"Begin with a thorough assessment of current capabilities and identify areas where {t} can deliver greatest value.",
                            "Establish clear success metrics, build cross-functional teams, and adopt an iterative approach allowing for learning and adjustment."
                        ]
                    }
                ]
            }
        ],
        "references": [
            f"{t}: Principles and Practice. Academic Press, 2024.",
            f"Global Industry Report on {t}. Market Research Institute, 2025.",
            f"Understanding {t}: A Practitioner's Guide. Professional Standards Board.",
            f"Emerging Trends in {t}. Technology Futures Quarterly, Vol. 12.",
        ]
    }

# ═══════════════════════════════════════════════════════════════════════════
# 4. PPT CONTENT GENERATION
# ═══════════════════════════════════════════════════════════════════════════

def generate_ppt_content(topic: str) -> dict:
    t = (topic or "Overview").strip()
    h = _topic_hash(t)
    themes = ["Modern Blue","Forest Green","Dark Mode Minimalist","Warm Terracotta","Vibrant Sunset"]

    slides = [
        {"slideNumber":1,"type":"Title Slide","title":t,"subtitle":"A Comprehensive Overview",
         "content":[],"speakerNotes":f"Welcome. Today we cover {t}.","imagePrompt":f"Title cover for {t}","chartType":""},
        {"slideNumber":2,"type":"Content Slide","title":"Introduction & Context","subtitle":"Setting the Foundation",
         "content":[f"{t} is a rapidly evolving field with broad impact",
                    "Historical roots trace back decades of research","Global adoption is accelerating across key sectors",
                    "Driven by technological advancement and changing needs","Understanding context is essential for effective application"],
         "speakerNotes":f"Establishing the context for {t}.","imagePrompt":f"Conceptual diagram of {t}","chartType":""},
        {"slideNumber":3,"type":"Two Column","title":"Core Principles","subtitle":"Foundational Framework",
         "content":["Principle 1: Systematic structured approach","Principle 2: Data-driven decision making",
                    "Principle 3: Iterative improvement cycle","Principle 4: Stakeholder alignment","Principle 5: Measurable outcomes"],
         "speakerNotes":"These principles underpin all aspects.","imagePrompt":f"Framework diagram for {t}","chartType":""},
        {"slideNumber":4,"type":"Image Left","title":"Key Applications","subtitle":"Real-World Impact",
         "content":["Enterprise adoption driving operational efficiency","Consumer products leveraging core capabilities",
                    "Research institutions advancing theoretical foundations","Government and public sector implementations",
                    "Cross-industry collaboration and knowledge transfer"],
         "speakerNotes":"Real-world applications demonstrate practical value.","imagePrompt":f"Global applications of {t}","chartType":""},
        {"slideNumber":5,"type":"Chart Slide","title":"Market Adoption & Growth","subtitle":"Data-Driven Insights",
         "content":["Sector A leading adoption at 75%","Sector B showing rapid 60% growth",
                    "Sector C emerging with 85% potential","Sector D in early adoption at 45%"],
         "speakerNotes":"Chart shows adoption distribution across key sectors.","imagePrompt":f"Growth chart for {t}","chartType":"bar"},
        {"slideNumber":6,"type":"Comparison","title":"Strengths vs Challenges","subtitle":"Strategic Assessment",
         "content":["High efficiency and productivity gains","Scalable across different contexts",
                    "Proven frameworks and methodologies","High initial investment required",
                    "Expertise and talent gaps exist","Integration with legacy systems is complex"],
         "speakerNotes":"Understanding both sides helps in planning realistic implementations.","imagePrompt":f"Balance for {t}","chartType":""},
        {"slideNumber":7,"type":"Timeline","title":"Implementation Roadmap","subtitle":"Path to Success",
         "content":["Phase 1: Assessment and planning","Phase 2: Pilot implementation",
                    "Phase 3: Evaluation and refinement","Phase 4: Full-scale deployment"],
         "speakerNotes":"A phased approach reduces risk and enables learning.","imagePrompt":f"Roadmap for {t}","chartType":""},
        {"slideNumber":8,"type":"Content Slide","title":"Future Trends","subtitle":"What Lies Ahead",
         "content":["Integration with emerging technologies","Increased automation and intelligence",
                    "Democratization of tools and access","Stronger governance and ethical frameworks",
                    "Global standardization initiatives underway"],
         "speakerNotes":"Staying ahead of trends is critical.","imagePrompt":f"Future vision for {t}","chartType":""},
        {"slideNumber":9,"type":"Content Slide","title":"Key Takeaways","subtitle":"Summary",
         "content":[f"{t} offers significant strategic value","A structured phased approach reduces risk",
                    "Data-driven decisions lead to better outcomes","Continuous learning and adaptation are essential",
                    "Start small, prove value, then scale"],
         "speakerNotes":"Summarizes the most important insights.","imagePrompt":f"Key insights from {t}","chartType":""},
        {"slideNumber":10,"type":"Conclusion Slide","title":"Thank You","subtitle":"Questions & Discussion",
         "content":["Open floor for questions","Resources available upon request"],
         "speakerNotes":"Thank the audience and open for Q&A.","imagePrompt":f"Thank you slide for {t}","chartType":""},
    ]

    return {"presentationTitle": t, "theme": themes[h % len(themes)], "slides": slides}

# ═══════════════════════════════════════════════════════════════════════════
# Format instructions for AI-guided generation
# ═══════════════════════════════════════════════════════════════════════════

_PDF_FORMAT = '''Return ONLY a valid JSON object with this structure:
{
  "documentTitle": "string",
  "documentType": "Research Paper | Project Report | Whitepaper | Business Report | Technical Documentation",
  "theme": "Modern Blue | Forest Green | Dark Mode Minimalist | Warm Terracotta | Vibrant Sunset",
  "executiveSummary": "string",
  "tableOfContents": ["string"],
  "sections": [
    {
      "sectionTitle": "string",
      "subsections": [
        {
          "subsectionTitle": "string",
          "paragraphs": ["string"],
          "table": {"headers": ["string"], "rows": [["string"]]} ,
          "chart": {"type": "bar|line|pie", "data": [{"label": "string", "value": 0}]}
        }
      ]
    }
  ],
  "references": ["string"]
}
Leave table/chart as null if not relevant. No markdown fences.'''

_PPT_FORMAT = '''Return ONLY a valid JSON object with this structure:
{
  "presentationTitle": "string",
  "theme": "Modern Blue | Forest Green | Dark Mode Minimalist | Warm Terracotta | Vibrant Sunset",
  "slides": [
    {
      "slideNumber": 1,
      "type": "Title Slide | Content Slide | Two Column | Image Left | Image Right | Comparison | Timeline | Chart Slide | Conclusion Slide",
      "title": "string",
      "subtitle": "string",
      "content": ["string"],
      "speakerNotes": "string",
      "imagePrompt": "string",
      "chartType": "bar | line | pie | doughnut | empty string"
    }
  ]
}
Generate 10-15 slides. No markdown fences.'''
