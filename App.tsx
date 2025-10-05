import React, { useState, useCallback } from 'react';
import { ScrapeResult } from './types';
import { scrapeEmailsFromUrl } from './services/geminiService';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ResultsDisplay from './components/ResultsDisplay';
import Loader from './components/Loader';

// XLSX is loaded from a script tag in index.html
declare var XLSX: any;

const App: React.FC = () => {
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');

  const processUrls = useCallback(async (urls: string[]) => {
    setResults(urls.map(url => ({ url, emails: [], status: 'pending' })));

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      setProgressMessage(`Scraping ${i + 1} of ${urls.length}: ${url}`);
      try {
        const emails = await scrapeEmailsFromUrl(url);
        setResults(prevResults =>
          prevResults.map(r =>
            r.url === url ? { ...r, emails, status: 'success' } : r
          )
        );
      } catch (err) {
        console.error(`Failed to scrape ${url}:`, err);
        setResults(prevResults =>
          prevResults.map(r =>
            r.url === url ? { ...r, emails: [], status: 'error' } : r
          )
        );
      }
    }

    setProgressMessage('');
    setIsProcessing(false);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setIsProcessing(true);
    setError(null);
    setResults([]);
    setProgressMessage('Reading Excel file...');

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        if (!e.target?.result) {
            throw new Error("File reader did not return a result.");
        }
        const data = new Uint8Array(e.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const urls = json
          .flat()
          .map(cell => String(cell).trim())
          .filter(cell => cell.startsWith('http://') || cell.startsWith('https://'));

        if (urls.length === 0) {
          throw new Error('No valid URLs found in the first sheet of the Excel file.');
        }
        
        processUrls(urls);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to read the Excel file.');
        setIsProcessing(false);
        setProgressMessage('');
      }
    };
    reader.onerror = () => {
        setError('Error reading file.');
        setIsProcessing(false);
        setProgressMessage('');
    };
    reader.readAsArrayBuffer(file);
  }, [processUrls]);

  const handleReset = () => {
    setResults([]);
    setIsProcessing(false);
    setError(null);
    setProgressMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <Header />

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg my-4 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        {isProcessing ? (
          <div className="text-center p-8 space-y-4">
            <Loader />
            <p className="text-lg text-indigo-300 animate-pulse">{progressMessage}</p>
          </div>
        ) : results.length > 0 ? (
          <ResultsDisplay results={results} onReset={handleReset} />
        ) : (
          <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        )}
      </div>
    </div>
  );
};

export default App;
