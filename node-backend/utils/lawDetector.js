import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the dataset
const datasetPath = path.join(__dirname, '../data/laws_dataset.json');
const lawsData = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

const INTENT_KEYWORDS = ["theft", "fraud", "hack", "cybercrime", "rape", "assault", "drugs", "murder", "police", "law", "illegal"];

export const detectLawIntent = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Check if any intent keyword is present in the query
    const isLegalQuery = INTENT_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
    if (!isLegalQuery) return null;

    // Perform matching against the dataset
    let matches = [];

    lawsData.forEach(item => {
        let score = 0;
        
        // 1. Keyword match
        item.keywords.forEach(kw => {
            if (lowerQuery.includes(kw.toLowerCase())) {
                score += 2;
            }
        });

        // 2. Crime name match
        if (lowerQuery.includes(item.crime.toLowerCase())) {
            score += 3;
        }

        if (score > 0) {
            matches.push({ ...item, score });
        }
    });

    // Sort by highest score
    matches.sort((a, b) => b.score - a.score);

    // Return top 3 matches if any
    if (matches.length > 0) {
        return matches.slice(0, 3);
    }

    return null;
};

export const formatLawResponse = (matches) => {
    if (!matches || matches.length === 0) {
        return `[UNKNOWN]\nI couldn't confidently map this to a specific Indian law. Please provide more details or consult a legal professional.\n\n[NOTE]\nThis is not legal advice.`;
    }

    let response = "Based on your situation, here are the most relevant Indian laws:\n\n";

    matches.forEach(match => {
        response += `[LAW]\n${match.law}\n\n[SECTION]\nSection ${match.section}\n\n[EXPLANATION]\n${match.description}\n\n[PUNISHMENT]\n${match.punishment}\n\n---\n\n`;
    });

    response += `[NOTE]\nThis is not legal advice.`;
    return response;
};
