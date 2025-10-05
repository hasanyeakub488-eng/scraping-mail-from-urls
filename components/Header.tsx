import React from 'react';
import { MailIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="text-center py-6 sm:py-10">
      <div className="flex justify-center items-center gap-4 mb-4">
        <MailIcon className="w-10 h-10 text-indigo-400" />
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
          AI Email Scraper
        </h1>
      </div>
      <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-lg">
        Upload an Excel file with URLs. Our AI will scan each page for email addresses and present them for you to download.
      </p>
    </header>
  );
};

export default Header;
