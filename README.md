# 🐊 Gator Gabber

**Get Gabbering: Gator-Powered Spanish Practice**

An AI-powered Spanish conversation partner designed specifically for University of Florida Spanish language students in mind! Practice speaking, get isntant feedback, and have the potential to get course aligned content powered by RAG

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://gatorgabber.vercel.app)


## **Features**
- **Speech-to-Text (STT)**: Speak in Spanish and see your words transcribed
- **Text-to-Speech (TTS)**: Listen to AI responses with customizable voice settings
- **Translation** Instant English translations of any message
- **Syllabification**: Break down Spanish words to improve pronunciation

  
## **Course-Aligned Cotent**
- **RAG System**: Potential to retrieve relevant information from course materials (PDFs, syllabi)
- **Class-Specific Contexts**: Switch between SPN1130, SPN1131, SPN2200, SPN2201
- **Personalized Responses**: AI tutor "Alberto" adapts to your class leve

## **Customizable Experiences**
- Adjust speech rate and pitch
- Select from available spanish voices
- Repeat messages at normal or slow speed
- interactive setting panel
## **File Structure**
- 
```
Gator_Gabber/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API services
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   └── package.json
│
├── GatorGabbeler/
│   └── server/               # FastAPI backend
│       ├── app/
│       │   ├── config/       # System prompts & config
│       │   ├── services/     # LLM services
│       │   │   └── providers/ # OpenAI provider
│       │   ├── rag/          # RAG system
│       │   │   ├── retriever.py
│       │   │   └── vector_store.py
│       │   └── main.py       # FastAPI app
│       ├── data/
│       │   └── spanish_1130/ # Course materials & vector DB
│       │       └── chroma_db/
│       └── requirements.txt
│
└── README.md
```

## UI Features

### **Modern, Responsive Design**
- Gator-themed color scheme (UF Blue & Orange)
- Card-based layout with smooth animations
- Mobile-optimized interface
- Gradient backgrounds and glassmorphism effects

### **Message Bubbles**
- User messages (right, orange gradient)
- AI messages (left, light gray)
- Translation bubbles (italic, gray)
- Syllabification bubbles (blue, spaced)

### **Interactive Elements**
- Circular action buttons
- Smooth hover effects
- Loading indicators
- Pulsing microphone when listening


## Troubleshooting

### **Backend won't start**
- Ensure Python 3.11 or 3.12 (not 3.14 - compilation issues)
- Check `OPENAI_API_KEY` is set in `.env`
- Verify all dependencies installed: `pip install -r requirements.txt`

### **Frontend can't connect to backend**
- Check `VITE_API_URL` in `client/.env`
- Ensure backend is running on port 5050
- Verify CORS origins in `main.py` include your frontend URL


---

## About

**GatorGabber** was created to help University of Florida students practice Spanish conversation in a supportive, AI-powered environment. The project emphasizes the UF Spanish department's approach of learning through verbal practice and real-world conversation.

Built with ❤️ by UF students, for UF students.

---
