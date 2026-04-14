import React, { useState } from 'react';
import UploadPage from './pages/UploadPage';
import ResultPage from './pages/ResultPage';
import { DUMMY_ANGLES } from './utils/dummyData';
import { Stethoscope } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('upload'); // 'upload' | 'result'
  const [analysisState, setAnalysisState] = useState({
    imageSrc: null,
    results: null
  });

  const handleUploadAndAnalyze = async (file, previewUrl) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Call CEPHMark-Net API Backend kita!
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server AI Error: ${response.status}`);
      }

      const liveData = await response.json();
      
      setAnalysisState({
        imageSrc: previewUrl,
        results: {
          landmarks: liveData.landmarks, // Titik dari AI Asli
          measurements: DUMMY_ANGLES     // Sudut dummy sementara (fitur sudut angle AI belum dibuat)
        }
      });
      setCurrentPage('result');
      
    } catch (error) {
      console.error("Analysis failed", error);
      alert('Analysis failed. Please try again.');
    }
  };

  const handleBackToUpload = () => {
    setCurrentPage('upload');
    setAnalysisState({
      imageSrc: null,
      results: null
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary/30 selection:text-primary">
      
      {/* Navbar Minimalist */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-tight">OrthoAI</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Cephalometric Diagnostics</p>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="py-8">
        {currentPage === 'upload' && (
          <UploadPage onUploadSuccess={handleUploadAndAnalyze} />
        )}
        
        {currentPage === 'result' && analysisState.results && (
          <ResultPage 
            imageSrc={analysisState.imageSrc} 
            results={analysisState.results}
            onBack={handleBackToUpload}
          />
        )}
      </main>

    </div>
  );
}

export default App;
