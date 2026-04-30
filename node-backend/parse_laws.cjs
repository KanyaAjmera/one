const fs = require('fs');
const path = require('path');

const rawText = fs.readFileSync(path.join(__dirname, 'raw_laws.txt'), 'utf8');

const blocks = rawText.split('--------------------------------------------------').map(b => b.trim()).filter(b => b.length > 0);

const dataset = [];

for (const block of blocks) {
  const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const lawObj = {};
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    lawObj[key] = value;
  }
  
  if (!lawObj['Crime']) continue;

  const bailable = lawObj['Bailable']?.toLowerCase() === 'yes';
  const cognizable = lawObj['Cognizable']?.toLowerCase() === 'yes';
  
  // Extract keywords
  const titleWords = lawObj['Crime'].toLowerCase().split(' ').filter(w => w.length > 2);
  const descWords = lawObj['Description'] ? lawObj['Description'].toLowerCase().split(' ').filter(w => w.length > 3) : [];
  const keywords = [...new Set([...titleWords, ...descWords])];
  
  dataset.push({
    law: lawObj['Law'] || 'Unknown Law',
    section: lawObj['Section'] || 'Unknown',
    title: lawObj['Crime'],
    category: lawObj['Category'] || 'General',
    description: lawObj['Description'] || '',
    elements: [lawObj['Description'] || 'General element'],
    punishment: {
      type: ["Imprisonment / Fine"],
      duration: lawObj['Punishment'] || 'Varies'
    },
    bailable: bailable,
    cognizable: cognizable,
    compoundable: false, // Default since not provided
    triable_by: lawObj['Triable By'] || 'Court',
    keywords: keywords
  });
}

fs.writeFileSync(
  path.join(__dirname, 'data', 'laws_dataset.json'),
  JSON.stringify(dataset, null, 2),
  'utf8'
);

console.log(`✅ Successfully parsed ${dataset.length} laws from raw text and updated laws_dataset.json.`);
