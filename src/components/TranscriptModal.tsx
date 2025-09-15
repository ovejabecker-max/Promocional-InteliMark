// src/components/TranscriptModal.tsx

import React, { useEffect, useRef } from 'react';
import './TranscriptModal.css';

// Define the structure of a single transcript message
interface Transcript {
  role: 'user' | 'assistant';
  text: string;
}

interface TranscriptModalProps {
  isOpen: boolean;
  transcripts: Transcript[];
}

export const TranscriptModal: React.FC<TranscriptModalProps> = ({ isOpen, transcripts }) => {
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalBodyRef.current) {
      modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
    }
  }, [transcripts]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="transcript-modal-container">
      <div className="transcript-modal-header">
        <h3 className="transcript-modal-title">REBECCA CHAT</h3>
      </div>
      <div className="transcript-modal-body" ref={modalBodyRef}>
        {transcripts.map((transcript, index) => (
          <div key={index} className="transcript-message">
            <span className="transcript-role">{transcript.role === 'user' ? 'Tú:' : 'Rebecca:'}</span>
            <span>{transcript.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};