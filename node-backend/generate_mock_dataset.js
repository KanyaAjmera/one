import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateDataset = () => {
  const dataset = [];
  
  for (let i = 1; i <= 150; i++) {
    const isBailable = i % 2 === 0;
    
    dataset.push({
      law: "IPC / IT Act",
      section: (300 + i).toString(),
      title: `Crime ${i}`,
      category: "General Crimes",
      description: `Detailed explanation of crime ${i} involving unlawful activity and violation of legal provisions.`,
      elements: ["Intent", "Action", "Harm"],
      punishment: {
        type: ["Imprisonment"],
        duration: "Varies (up to imprisonment depending on severity)",
        fine: "Applicable based on court decision"
      },
      bailable: isBailable,
      cognizable: true,
      compoundable: false,
      triable_by: "Magistrate / Sessions Court",
      examples: [`Example: Scenario explaining how crime ${i} occurs in real life.`],
      keywords: [`keyword${i}`, `crime${i}`, `law${i}`]
    });
  }

  const original = [
    {
      law: "Indian Penal Code",
      section: "302",
      title: "Murder",
      category: "Crimes Against Person",
      description: "Intentional killing of a person.",
      elements: ["Intent", "Act caused death"],
      punishment: {
        type: ["Death Penalty", "Life Imprisonment"],
        fine: "Optional"
      },
      bailable: false,
      cognizable: true,
      compoundable: false,
      triable_by: "Sessions Court",
      keywords: ["kill", "murder"]
    },
    {
      law: "Indian Penal Code",
      section: "420",
      title: "Cheating",
      category: "Property & Fraud",
      description: "Dishonest inducement to deliver property.",
      elements: ["Deception", "Dishonest intent"],
      punishment: {
        type: ["Imprisonment"],
        duration: "Up to 7 years"
      },
      bailable: false,
      cognizable: true,
      compoundable: true,
      triable_by: "Magistrate",
      keywords: ["fraud", "scam"]
    }
  ];

  const fullDataset = [...original, ...dataset];
  
  fs.writeFileSync(
    path.join(__dirname, 'data', 'laws_dataset.json'),
    JSON.stringify(fullDataset, null, 2),
    'utf8'
  );
  
  console.log('✅ Mock dataset generated successfully with ' + fullDataset.length + ' entries.');
};

generateDataset();
