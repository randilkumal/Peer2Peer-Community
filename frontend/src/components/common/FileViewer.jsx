import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Loader from './Loader';
import { X, Download, FileText, File, FileArchive, FileSpreadsheet, AlertCircle } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const FileViewer = ({ isOpen, onClose, fileUrl, fileName, fileType, downloadUrl }) => {
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState(null);
  const [error, setError] = useState(null);
  const [fileBlob, setFileBlob] = useState(null);

  useEffect(() => {
    if (isOpen && fileUrl) {
      const type = fileType?.toLowerCase() || '';
      if (type.includes('pdf')) {
        const token = localStorage.getItem('token');
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const url = fileUrl.startsWith('http') 
          ? fileUrl 
          : fileUrl.includes('/uploads') ? `${apiBase.replace(/\/api\/?$/, '')}${fileUrl}` : `${apiBase.replace(/\/$/, '')}${fileUrl}?token=${token}`;
        
        setFileContent(url);
        setLoading(false);
      } else {
        loadFile();
      }
    } else {
      // Clean up when modal closes
      if (fileBlob) {
        window.URL.revokeObjectURL(fileBlob);
        setFileBlob(null);
      }
      setFileContent(null);
      setError(null);
    }
  }, [isOpen, fileUrl]);

  const loadFile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${apiBase.replace(/\/$/, '')}${fileUrl}?token=${token}`;
      
      const response = await API.get(url, {
        responseType: 'blob'
      });
      
      let mimeType = fileType || 'application/octet-stream';
      const blob = new Blob([response.data], { type: mimeType });
      const blobUrl = window.URL.createObjectURL(blob);
      setFileBlob(blobUrl);
      setFileContent(blobUrl);
    } catch (err) {
      console.error('File load error:', err);
      setError('Failed to load file');
      toast.error('Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (fileBlob) {
      const link = document.createElement('a');
      link.href = fileBlob;
      link.download = fileName || 'file';
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started');
    } else if (downloadUrl) {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const dUrl = downloadUrl.startsWith('http') 
        ? downloadUrl 
        : `${apiBase.replace(/\/$/, '')}${downloadUrl}?token=${token}`;
      window.open(dUrl, '_blank');
    } else if (fileContent && typeof fileContent === 'string' && fileContent.startsWith('http')) {
      const dUrl = fileContent.replace('/view', '/download');
      window.open(dUrl, '_blank');
    } else {
      const token = localStorage.getItem('token');
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const url = fileUrl.startsWith('http') 
        ? fileUrl 
        : `${apiBase.replace(/\/$/, '')}${fileUrl}?token=${token}`;
      window.open(url.replace('/view', '/download'), '_blank');
    }
  };

  const getFileIcon = () => {
    const type = fileType?.toLowerCase() || '';
    if (type.includes('pdf')) return <FileText className="w-16 h-16 text-red-500" />;
    if (type.includes('doc')) return <FileText className="w-16 h-16 text-blue-500" />;
    if (type.includes('xls') || type.includes('sheet')) return <FileSpreadsheet className="w-16 h-16 text-green-500" />;
    if (type.includes('zip') || type.includes('rar')) return <FileArchive className="w-16 h-16 text-yellow-500" />;
    if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('gif')) {
      return fileContent ? (
        <img src={fileContent} alt={fileName} className="max-w-full max-h-full object-contain" />
      ) : (
        <File className="w-16 h-16 text-gray-500" />
      );
    }
    return <File className="w-16 h-16 text-gray-500" />;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader size="lg" text="Loading file..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button 
            size="sm" 
            onClick={handleDownload}
            icon={Download}
          >
            Download Instead
          </Button>
        </div>
      );
    }

    const type = fileType?.toLowerCase() || '';

    // PDF
    if (type.includes('pdf')) {
      return (
        <iframe
          src={`${fileContent}#toolbar=1&navpanes=1`}
          className="w-full h-[80vh]"
          title={fileName || 'PDF Viewer'}
        />
      );
    }

    // Images
    if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || 
        type.includes('gif') || type.includes('svg') || type.includes('webp')) {
      return (
        <div className="flex items-center justify-center h-[80vh] bg-gray-900">
          <img 
            src={fileContent} 
            alt={fileName} 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );
    }

    // Text files
    if (type.includes('txt') || type.includes('text') || type.includes('json') || type.includes('js') || type.includes('css')) {
      return (
        <div className="h-[80vh] overflow-auto p-6 bg-gray-900 text-gray-100 font-mono text-sm">
          <pre className="whitespace-pre-wrap">{fileContent}</pre>
        </div>
      );
    }

    // Video files
    if (type.includes('mp4') || type.includes('webm') || type.includes('ogg') || type.includes('mov')) {
      return (
        <div className="flex items-center justify-center h-[80vh] bg-black">
          <video controls className="max-w-full max-h-full">
            <source src={fileContent} type={fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    // Audio files
    if (type.includes('mp3') || type.includes('wav') || type.includes('ogg') || type.includes('m4a')) {
      return (
        <div className="flex items-center justify-center h-[80vh] bg-gray-900">
          <audio controls className="w-full max-w-2xl">
            <source src={fileContent} type={fileType} />
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    // For other file types, show download option
    return (
      <div className="text-center py-10">
        <div className="mb-4">
          {getFileIcon()}
        </div>
        <p className="text-gray-600 mb-2">
          This file type cannot be previewed
        </p>
        <p className="text-sm text-gray-500 mb-4">
          {fileName} ({fileType})
        </p>
        <Button 
          icon={Download}
          onClick={handleDownload}
          size="lg"
        >
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={fileName || 'File Viewer'}
      size="full"
      footer={null}
    >
      <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              icon={Download}
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-4">
              {fileName}
            </span>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* File Content */}
        <div className="flex-1 overflow-auto bg-gray-100">
          {renderContent()}
        </div>
      </div>
    </Modal>
  );
};

export default FileViewer;