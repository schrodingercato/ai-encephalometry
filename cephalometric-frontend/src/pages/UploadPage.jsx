import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';

const UploadPage = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/bmp': ['.bmp']
    },
    maxFiles: 1
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    // The parent component handles the API call orchestration
    await onUploadSuccess(file, previewUrl);
    // We don't necessarily need to set isAnalyzing to false if the component unmounts
    // but doing so prevents React warnings if it unmounts too fast
    setIsAnalyzing(false); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
          Digital Cephalometric Analysis
        </h1>
        <p className="text-slate-500 max-w-xl mx-auto text-lg leading-relaxed">
          Upload a lateral cephalogram X-ray and let AI automatically detect 29 anatomical landmarks to aid your orthodontic diagnosis.
        </p>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in-up border border-slate-100">
        <div className="p-8 sm:p-12">
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-xl p-12 transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center min-h-[300px]
                ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'}
              `}
            >
              <input {...getInputProps()} />
              <div className="bg-primary/10 p-4 rounded-full mb-6">
                <UploadCloud className="w-12 h-12 text-primary" />
              </div>
              <p className="text-xl font-semibold text-slate-700 mb-2">
                Click or drag image to upload
              </p>
              <p className="text-slate-500 text-sm">
                Supported formats: JPG, PNG, BMP (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden mb-8 shadow-inner border border-slate-200 group">
                <img
                  src={previewUrl}
                  alt="X-Ray Preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 hover:text-red-700 hover:bg-white px-4 py-2 rounded-full font-medium text-sm transition-colors shadow-sm"
                  disabled={isAnalyzing}
                >
                  Remove
                </button>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full py-4 rounded-xl text-lg font-bold text-white transition-all duration-300 shadow-lg shadow-primary/30 flex items-center justify-center gap-3
                  ${isAnalyzing ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 hover:-translate-y-1 hover:shadow-xl shadow-primary/40'}
                `}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Analyzing Image with AI...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-6 h-6" />
                    Analyze Now
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
