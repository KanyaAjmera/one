import requests
from bs4 import BeautifulSoup
import json
import re
import time

BASE_URL = "https://www.indiacode.nic.in"

# IPC page (main act page)
IPC_URL = "https://www.indiacode.nic.in/handle/123456789/4210"  # fallback base


def fetch_html(url):
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    res = requests.get(url, headers=headers)
    res.raise_for_status()
    return res.text


def extract_sections_from_text(text):
    """
    Extract sections using regex patterns
    """
    sections = []

    # Match: Section number + title
    pattern = r"Section\s+(\d+[A-Z]?)\s*[-–]?\s*(.*)"

    lines = text.split("\n")

    current = None

    for line in lines:
        match = re.match(pattern, line.strip())

        if match:
            if current:
                sections.append(current)

            current = {
                "section": match.group(1),
                "title": match.group(2),
                "description": ""
            }
        elif current:
            current["description"] += " " + line.strip()

    if current:
        sections.append(current)

    return sections


def scrape_ipc():
    print("Fetching IPC page...")

    html = fetch_html(IPC_URL)
    soup = BeautifulSoup(html, "html.parser")

    # Extract all text (fallback approach)
    full_text = soup.get_text(separator="\n")

    sections = extract_sections_from_text(full_text)

    print(f"Extracted {len(sections)} sections")

    return sections


def structure_data(sections):
    return {
        "act": "Indian Penal Code",
        "year": 1860,
        "total_sections": len(sections),
        "sections": [
            {
                "section": sec["section"],
                "title": sec["title"],
                "description": sec["description"].strip(),
                "keywords": sec["title"].lower().split()
            }
            for sec in sections
        ]
    }


def save_json(data, filename="ipc_full.json"):
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    sections = scrape_ipc()
    data = structure_data(sections)
    save_json(data)

    print("✅ IPC dataset saved as ipc_full.json")
