from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

# Enable CORS so your React frontend can communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    symptoms: str = Form(...)
):
    # Parse the clinical observations JSON sent from frontend
    symptom_data = json.loads(symptoms)
    
    # Read image contents (you can pass this to TensorFlow / OpenCV later)
    image_bytes = await image.read()
    
    # Mocking the AI response for your hackathon prototype
    # Replace this dictionary with your actual model's prediction output
    return {
        "riskScore": 89.4,
        "status": "High Malignancy Indicator Detected",
        "recommendation": "Immediate referral to a clinical dermatologist/oncologist recommended.",
        "symptomsReceived": symptom_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)