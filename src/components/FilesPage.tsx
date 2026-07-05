import React, { useState, useRef } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { FileUp, Search, Trash2, FileText, Image, FileCode, MessageSquare, AlertCircle } from 'lucide-react';
import { UploadedFile } from '../types';

export const FilesPage: React.FC = () => {
  const { files, uploadFile, deleteFile, createNewChat } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (rawFile: File) => {
    setErrorMsg(null);
    const validTypes = [
      'application/pdf',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
    ];

    if (!validTypes.includes(rawFile.type) && !rawFile.name.endsWith('.docx')) {
      setErrorMsg('Unsupported file format. Please upload PDF, TXT, DOCX, or JPG/PNG/WEBP images.');
      return;
    }

    if (rawFile.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB platform limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      await uploadFile({
        name: rawFile.name,
        type: rawFile.type,
        size: rawFile.size,
        base64: base64String
      });
    };
    reader.readAsDataURL(rawFile);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const triggerSearchAnalysis = (file: UploadedFile) => {
    createNewChat('file_analysis');
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="w-5 h-5 text-indigo-500" />;
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      default:
        return <FileCode className="w-5 h-5 text-emerald-500" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#EDEDED] px-6 py-8 md:px-12 md:py-12 scrollbar-none">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8 mt-6 md:mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase bg-neutral-200 text-neutral-850 border border-neutral-300">
              Cabinet Storage
            </span>
          </div>
          <h2 className="text-3xl font-semibold text-black tracking-tight font-sans">Files & Documents</h2>
          <p className="text-xs text-neutral-500 mt-2 font-sans leading-relaxed">
            Upload PDFs, documents, or images to analyze, extract OCR data, summarize, and cross-examine with specialized agents.
          </p>
        </div>

        {/* Drag and Drop Box */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-black bg-white/40'
              : 'border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50/80 shadow-xs'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.txt,.docx,image/*"
          />
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-250 mb-4 group-hover:scale-105 transition-transform">
            <FileUp className="w-5 h-5 text-black" />
          </div>
          <h3 className="text-sm font-semibold text-neutral-850 font-sans">Upload or drop document here</h3>
          <p className="text-xs text-neutral-450 mt-1.5 text-center max-w-xs font-sans">
            Supports PDF, DOCX, TXT, and JPG/PNG up to 15MB. Real-time OCR and Multimodal comprehension available.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Search & List */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-neutral-800 font-sans">Stored Files ({files.length})</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search file inventory..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-neutral-350 rounded-xl py-1.5 pl-8 pr-3 text-xs text-black placeholder-neutral-400 focus:outline-none focus:border-neutral-400 shadow-2xs transition-all"
              />
            </div>
          </div>

          {filteredFiles.length === 0 ? (
            <div className="border border-neutral-300/60 rounded-2xl p-12 text-center bg-white/40">
              <p className="text-xs text-neutral-450 font-mono italic">No matching files found in your cabinet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  className="group relative flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-300 hover:bg-neutral-50/50 transition-all duration-200 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200 shrink-0">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-850 truncate max-w-[200px]" title={file.name}>
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono text-neutral-450">{formatSize(file.size)}</span>
                        <span className="w-1 h-1 rounded-full bg-neutral-300" />
                        <span className="text-[10px] font-mono text-neutral-450 capitalize">{file.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => triggerSearchAnalysis(file)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                      title="Analyze with File Intel Agent"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
