# Earthquake Support System

## AI-Based Multi-Modal Decision Support System for Earthquake Damage Assessment and Emergency Response

This project is an artificial intelligence-based multi-modal decision support system developed for earthquake damage assessment and emergency response planning. The system integrates earthquake records, satellite imagery, and social media data within a single web-based platform to support disaster analysis, regional prioritization, and emergency decision-making.

## Project Purpose

Earthquake disasters produce large amounts of information from different sources such as seismic records, satellite images, and social media posts. When these sources are analyzed separately, decision-makers may receive fragmented and incomplete information. This project aims to solve this problem by combining multiple data sources into a unified decision-support framework.

The system analyzes:

* Earthquake records from AFAD
* Satellite images for damaged and undamaged building detection
* Turkish earthquake-related tweets
* Integrated risk scores and emergency response priorities

## Main Modules

### 1. Earthquake Risk Analysis Module

This module processes earthquake records and generates earthquake risk indicators based on seismic features such as magnitude, depth, location, and time. A machine learning-based model is used to classify earthquake risk levels.

### 2. Satellite Damage Assessment Module

This module analyzes post-earthquake satellite images and classifies buildings as damaged or undamaged. A ResNet18-based deep learning model is used for image classification.

### 3. Social Media Intelligence Module

This module analyzes Turkish earthquake-related tweets to identify emergency signals, urgency levels, and disaster-related information. NLP-based processing and BERTurk-based analysis are used for tweet classification.

### 4. Multi-Modal Data Fusion Layer

The outputs of the earthquake, satellite, and tweet analysis modules are combined to generate an integrated disaster risk score.

### 5. Decision Support Layer

This layer produces:

* Final disaster risk score
* Regional priority ranking
* Emergency response recommendations
* Integrated disaster assessment report

## Technologies Used

### Frontend

* React.js
* Vite
* JavaScript
* CSS
* Axios
* React Router DOM

### Backend

* Python
* FastAPI
* Uvicorn

### Machine Learning and AI

* Scikit-Learn
* PyTorch
* Torchvision
* Hugging Face Transformers
* ResNet18
* BERTurk
* HistGradientBoosting

### Data Processing

* Pandas
* NumPy
* Matplotlib

### Data Storage

* Browser localStorage

## Project Structure

```text
earthquake-support-system/
├── backend/
│   ├── main.py
│   └── services/
│       ├── decision_service.py
│       ├── earthquake_service.py
│       ├── report_service.py
│       ├── satellite_service.py
│       ├── tweet_model_service.py
│       └── tweet_service.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── components/
│   │   └── pages/
│   │       ├── Dashboard.jsx
│   │       ├── EarthquakeAnalysis.jsx
│   │       ├── History.jsx
│   │       ├── IntegratedReport.jsx
│   │       ├── NewAnalysis.jsx
│   │       ├── SatelliteDamageAnalysis.jsx
│   │       └── TweetAnalysis.jsx
│   ├── package.json
│   └── vite.config.js
│
├── README.md
└── .gitignore
```

## Dataset Information

The datasets are not included in this repository due to file size limitations and licensing considerations. Users should download the datasets from their original sources.

### 1. AFAD Earthquake Records

* Source: AFAD
* Link: https://deprem.afad.gov.tr
* Data type: Tabular earthquake records
* Used for: Earthquake Risk Analysis Module

### 2. Damaged and Undamaged Building Dataset

* Source: Kaggle
* Link: https://www.kaggle.com/datasets/selmanyaln/6-february-earthquake-undamaged-damaged-buildings
* Data type: Satellite images
* Classes: Damaged, Undamaged
* Used for: Satellite Damage Assessment Module

### 3. Turkish Earthquake Tweets Dataset

* Source: Kaggle
* Link: https://www.kaggle.com/datasets/aliburakcan/6-february-maras-earthquake-turkish-tweets
* Data type: Turkish text data
* Used for: Social Media Intelligence Module

## Recommended Local Dataset Structure

```text
backend/
├── models/
│   ├── earthquake_model/
│   ├── satellite_model/
│   └── tweet_model/
│
├── uploads/
│   └── satellite_images/
│
└── data/
    ├── earthquake/
    ├── satellite/
    └── tweets/
```

The `models`, `uploads`, and dataset folders are excluded from GitHub using `.gitignore`.

## Pre-trained Models

Trained model files are not included in this repository due to GitHub storage limitations.

Download the trained models from:

https://drive.google.com/file/d/1avRXB_77VxfTYfvxpeIP66Y8UfA5HVR5/view?usp=sharing

After downloading, extract the archive and place the model folders under:

```text
backend/models/
├── earthquake_model/
├── satellite_model/
└── tweet_model/

## Installation and Running the Project

### 1. Clone the Repository

```bash
git clone https://github.com/sabihadiler/earthquake-support-system.git
cd earthquake-support-system
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
```

For Windows:

```bash
venv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn main:app --reload
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will usually run at:

```text
http://localhost:5173
```

The backend will usually run at:

```text
http://localhost:8000
```

## Usage

1. Start the FastAPI backend.
2. Start the React frontend.
3. Open the web application in a browser.
4. Upload earthquake, satellite, or tweet datasets.
5. Run the selected analysis module.
6. View module-level results.
7. Generate the integrated emergency decision report.
8. Review previous analyses from the History page.

## System Outputs

The system produces:

* Earthquake risk classification
* Satellite-based damage assessment
* Tweet-based emergency signal analysis
* Integrated disaster risk score
* Regional priority ranking
* Emergency response recommendation
* Decision support report

## Experimental Results

The system was evaluated using three different data modalities:

| Module                      | Model                   | Output                                    |
| --------------------------- | ----------------------- | ----------------------------------------- |
| Earthquake Risk Analysis    | HistGradientBoosting    | Risk level prediction                     |
| Satellite Damage Assessment | ResNet18                | Damaged / Undamaged classification        |
| Social Media Intelligence   | BERTurk-based NLP model | Tweet risk and urgency analysis           |
| Decision Support            | Rule-based fusion       | Integrated risk score and recommendations |

The satellite damage assessment model achieved high classification performance, while the earthquake and social media modules provided complementary information for integrated disaster assessment.

## Limitations

* The current version works with manually uploaded datasets.
* Real-time AFAD, satellite, or Twitter API integration is not included.
* The system is designed as a local research prototype.
* Browser localStorage is used instead of a persistent database.
* Model performance depends on dataset quality and preprocessing consistency.
* Large model files and datasets are not included in this repository.

## Future Work

* Real-time AFAD earthquake data integration
* Live social media stream analysis
* Cloud deployment
* Persistent database integration
* GIS-based map visualization
* Advanced multi-modal fusion strategies
* User authentication and role-based access control
* More diverse disaster datasets

## Authors

* Görkem Tekin
* Sabiha Nur Diler

Department of Computer Engineering
Istanbul Arel University

## Academic Context

This project was developed as a graduation thesis project for the Computer Engineering Department at Istanbul Arel University. It demonstrates the practical use of Artificial Intelligence, Computer Vision, Natural Language Processing, Machine Learning, and web technologies for earthquake disaster management and emergency response support.

## License

This project is developed for academic and research purposes. Dataset licenses belong to their original providers. Please check the original dataset pages before using the datasets in another project.
