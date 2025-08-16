Here's a Python script that uses **Llama 3** (via Ollama) to generate 10 interview questions for a given skill (like C++) in JSON format, **ignoring proficiency**:

### **Python Code**
```python
import requests
import json

def generate_questions(skill_name, category, num_questions=10):
    """
    Uses Llama 3 via Ollama API to generate interview questions.
    """
    prompt = f"""
    Generate {num_questions} interview questions about {skill_name} ({category}) in JSON format.
    Each question should have:
    - 1 correct answer
    - 3 incorrect answers
    Format:
    ```json
    {{
        "skill": "{skill_name}",
        "category": "{category}",
        "questions": [
            {{
                "question": "...",
                "correct_answer": "...",
                "incorrect_answers": ["...", "...", "..."]
            }}
        ]
    }}
    ```
    Do not include proficiency/difficulty levels.
    """
    
    # Ollama API endpoint (default: http://localhost:11434)
    ollama_url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3",
        "prompt": prompt,
        "format": "json",
        "stream": False
    }
    
    try:
        response = requests.post(ollama_url, json=payload)
        response.raise_for_status()
        generated_text = response.json()["response"]
        
        # Extract JSON from the response (Llama 3 sometimes adds extra text)
        json_start = generated_text.find('{')
        json_end = generated_text.rfind('}') + 1
        json_data = json.loads(generated_text[json_start:json_end])
        
        return json_data
    except Exception as e:
        print(f"Error: {e}")
        return None

# Example usage
if __name__ == "__main__":
    skill_data = {
        "name": "C++",
        "category": "Programming"
    }
    
    questions = generate_questions(skill_data["name"], skill_data["category"])
    if questions:
        with open(f"{skill_data['name']}_questions.json", "w") as f:
            json.dump(questions, f, indent=2)
        print(f"Generated {len(questions['questions'])} questions for {skill_data['name']}!")
```

---

### **How to Run This**
1. **Install Ollama** (if not already installed):
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Pull Llama 3**:
   ```bash
   ollama pull llama3
   ```

3. **Run the Python script**:
   ```bash
   python generate_questions.py
   ```

4. **Output Example (`C++_questions.json`)**:
   ```json
   {
     "skill": "C++",
     "category": "Programming",
     "questions": [
       {
         "question": "What is a smart pointer in C++?",
         "correct_answer": "A pointer that automatically manages memory using RAII",
         "incorrect_answers": [
           "A pointer that is faster than raw pointers",
           "A pointer that only works with STL containers",
           "A pointer that cannot be copied"
         ]
       },
       {
         "question": "What is the purpose of the 'virtual' keyword in C++?",
         "correct_answer": "To enable polymorphic behavior in derived classes",
         "incorrect_answers": [
           "To make a function run faster",
           "To allocate memory dynamically",
           "To prevent a class from being inherited"
         ]
       }
     ]
   }
   ```

---

### **Key Features**
- **No Proficiency/Difficulty Levels**: Strictly follows your requirement.  
- **Ollama Integration**: Runs locally for privacy.  
- **Structured JSON**: Ready for your training dataset.  

**Need adjustments?** Let me know if you want to:  
- Change the question style.  
- Add more fields (e.g., `tags`).  
- Optimize for speed (e.g., use `llama3:8b` instead of `70b`).  

🚀 **Pro Tip**: For faster responses, use `model: "llama3:8b"` in the payload!