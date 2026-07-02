file_path = r"C:\Users\hp\.gemini\antigravity-ide\brain\b584439e-f249-4a85-9ad4-5d1401aa3d70\.system_generated\steps\374\content.md"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Write the first 10,000 characters to first_part.js
with open("first_part.js", "w", encoding="utf-8") as out:
    out.write(content[:10000])

print("Wrote first 10000 characters to first_part.js")
