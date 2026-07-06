import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Send, Download, FileText, BotMessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('Analyze this infrastructure report for severity, potential hazards, and recommended action.');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDimension = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          setImage(canvas.toDataURL(file.type, 0.7));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: image.split(',')[1],
          mimeType,
          prompt,
        }),
      });
      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing report:', error);
      setAnalysis('Failed to analyze the report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const reportText = `CivicOps Infrastructure Report\n---------------------------\n\n${analysis}`;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'civicops_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-rose-50 p-6 md:p-12 font-sans text-slate-900">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto mb-12 text-center"
      >
        <h1 className="text-5xl font-extrabold tracking-tighter text-slate-950 mb-2">CivicOps</h1>
        <p className="text-slate-600 text-lg">Predictive Environmental & Infrastructure Intelligence</p>
      </motion.header>

      <main className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-950">
            <FileText className="w-6 h-6 text-indigo-600" /> Report an Issue
          </h2>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300"
          >
            <Upload className="w-12 h-12 text-slate-400 mb-3" />
            <p className="font-medium text-slate-700">Click or drag & drop image</p>
            <p className="text-sm text-slate-500 mt-1">High-resolution images work best</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          {image && (
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={image} alt="Report" className="mt-6 rounded-2xl w-full h-56 object-cover shadow-inner" 
            />
          )}
          
          <textarea 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full mt-6 p-4 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-200 transition"
            rows={3}
          />
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={!image || loading}
            className="w-full mt-6 bg-slate-900 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Analyzing...' : <><Send className="w-5 h-5 mr-2" /> Submit for Analysis</>}
          </motion.button>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-slate-950">
            <BotMessageSquare className="w-6 h-6 text-indigo-600" /> AI Insight
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 rounded-full w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-full"></div>
              <div className="h-4 bg-slate-100 rounded-full w-5/6"></div>
              <div className="h-4 bg-slate-100 rounded-full w-1/2"></div>
            </div>
          ) : analysis ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap">{analysis}</div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadReport}
                className="text-indigo-600 flex items-center font-semibold hover:text-indigo-800 transition"
              >
                <Download className="w-5 h-5 mr-2" /> Download Report
              </motion.button>
            </motion.div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-3 border-2 border-dashed border-slate-100 rounded-2xl">
              <BotMessageSquare className="w-12 h-12 opacity-50" />
              <p className="text-sm italic">Analysis will appear here...</p>
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
}
