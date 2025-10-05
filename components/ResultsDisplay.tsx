import React, { useMemo } from 'react';
import { ScrapeResult } from '../types';
import { DownloadIcon, RefreshIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from './Icons';

interface ResultsDisplayProps {
  results: ScrapeResult[];
  onReset: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onReset }) => {
  const totalEmailsFound = useMemo(() => {
    return results.reduce((acc, result) => acc + result.emails.length, 0);
  }, [results]);

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,URL,Email\n";
    results.forEach(result => {
      if (result.emails.length > 0) {
        result.emails.forEach(email => {
          csvContent += `${result.url},${email}\n`;
        });
      } else {
        csvContent += `${result.url},\n`;
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scraped_emails.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusIcon = (status: ScrapeResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-400 animate-spin" />;
    }
  };
  
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 shadow-2xl mt-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Scraping Results</h2>
          <p className="text-slate-400">Found <span className="font-bold text-indigo-400">{totalEmailsFound}</span> emails across <span className="font-bold text-indigo-400">{results.length}</span> URLs.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold rounded-lg transition-all duration-200"
          >
            <RefreshIcon className="w-5 h-5" />
            Start New
          </button>
          <button
            onClick={downloadCSV}
            disabled={totalEmailsFound === 0}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-all duration-200 disabled:bg-indigo-900/50 disabled:cursor-not-allowed"
          >
            <DownloadIcon className="w-5 h-5" />
            Download CSV
          </button>
        </div>
      </div>

      <div className="max-h-[50vh] overflow-y-auto pr-2">
        <table className="w-full text-left table-fixed">
          <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
            <tr>
              <th className="p-3 text-sm font-semibold text-slate-400 tracking-wider w-1/12">Status</th>
              <th className="p-3 text-sm font-semibold text-slate-400 tracking-wider w-5/12">Source URL</th>
              <th className="p-3 text-sm font-semibold text-slate-400 tracking-wider w-6/12">Emails Found</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {results.map((result, index) => (
              <tr key={index} className="hover:bg-slate-700/50">
                <td className="p-3 align-top">
                  <span className="flex justify-center">{getStatusIcon(result.status)}</span>
                </td>
                <td className="p-3 text-slate-300 truncate align-top">{result.url}</td>
                <td className="p-3 text-cyan-300 align-top break-words">
                  {result.emails.length > 0 ? result.emails.join(', ') : <span className="text-slate-500">None</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsDisplay;
