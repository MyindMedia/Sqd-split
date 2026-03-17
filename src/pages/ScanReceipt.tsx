import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useAction, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { useRef, useState } from 'react';
import './ScanReceipt.css';

export default function ScanReceipt() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Convex hooks
  const event = useQuery(api.splitEvents.getEvent, eventId ? { eventId: eventId as Id<"splitEvents"> } : "skip");
  const generateUploadUrl = useMutation(api.splitEvents.generateUploadUrl);
  const processReceipt = useAction(api.ocr.processReceipt);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !eventId) return;

    setIsUploading(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload to Convex Storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await result.json();

      // 3. Trigger OCR Action
      await processReceipt({
        eventId: eventId as Id<"splitEvents">,
        storageId,
      });

      // 4. Navigate back to claim screen where items will appear
      navigate(`/claim/${eventId}`);
    } catch (err) {
      console.error("Upload/OCR failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="scan-page animate-fade-in">
      <header className="page-header transparent">
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="title-md">{event?.name || "Scan Receipt"}</span>
        <button className="icon-btn">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="2" stroke="#adaaaa" strokeWidth="1.5"/>
            <path d="M10 2V4.5M10 15.5V18M2 10H4.5M15.5 10H18M4.34 4.34L6.11 6.11M13.89 13.89L15.66 15.66M4.34 15.66L6.11 13.89M13.89 6.11L15.66 4.34" stroke="#adaaaa" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </header>

      {/* Viewfinder Area */}
      <div className="viewfinder">
        <div className="viewfinder-corners">
          <div className="corner tl" />
          <div className="corner tr" />
          <div className="corner bl" />
          <div className="corner br" />
        </div>
        {!isUploading && <div className="scan-line" />}
        {isUploading && (
          <div className="upload-overlay">
            <div className="pulsing-logo-mini" />
            <span className="label-md">AIScanning...</span>
          </div>
        )}
      </div>

      <div className="scan-controls">
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileChange}
        />
        
        <div className="scan-tips">
          <span className="label-md">Tip: Hold steady for best results</span>
          <span className="label-sm text-muted">Make sure the text is clearly legible</span>
        </div>
        
        <div className="capture-row">
          <button className="gallery-btn" onClick={handleCapture}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.5"/>
              <circle cx="8.5" cy="8.5" r="1.5" fill="white"/>
              <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <button className={`capture-outer ${isUploading ? 'processing' : ''}`} onClick={handleCapture} disabled={isUploading}>
            <div className="capture-inner" />
          </button>
          
          <button className="flash-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <button className="manual-btn" onClick={() => navigate(`/claim/${eventId}`)}>
          <span className="body-md">Manual Entry</span>
        </button>
      </div>
    </div>
  );
}
