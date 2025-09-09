import { useState, useEffect, useCallback, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import type { VapiConfig, VapiCallStatus, VapiHookReturn } from '../types/vapi';

export const useVapi = (config: VapiConfig): VapiHookReturn => {
  const [callStatus, setCallStatus] = useState<VapiCallStatus>({
    status: 'inactive',
    messages: [],
    activeTranscript: '',
    isUserSpeaking: false,
    assistantVolume: 0,
  });

  const vapiRef = useRef<Vapi | null>(null);
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    vapiRef.current = new Vapi(config.publicKey);
    const vapi = vapiRef.current;

    vapi.on('call-start', () => {
      console.log('✅ Vapi: Llamada iniciada');
      setCallStatus(prev => ({ ...prev, status: 'active' }));
    });

    vapi.on('call-end', () => {
      console.log('🔴 Vapi: Llamada terminada');
      setCallStatus(prev => ({ 
        ...prev, 
        status: 'inactive',
        activeTranscript: '',
        isUserSpeaking: false,
        assistantVolume: 0,
      }));
    });

    vapi.on('speech-start', () => {
      console.log('🎤 Vapi: Usuario comenzó a hablar');
      setCallStatus(prev => ({ ...prev, isUserSpeaking: true }));
    });

    vapi.on('speech-end', () => {
      console.log('🔇 Vapi: Usuario terminó de hablar');
      setCallStatus(prev => ({ ...prev, isUserSpeaking: false }));
    });

    vapi.on('message', (message: any) => {
      console.log('💬 Vapi: Mensaje recibido:', message);
      if (message.type === 'assistant-message' || (message.role === 'assistant' && message.content)) {
        setCallStatus(prev => ({
          ...prev,
          messages: [...(prev.messages || []), {
            role: message.role,
            content: message.content,
            timestamp: new Date()
          }]
        }));
      }
      if (message.type === 'transcript' && message.transcriptType === 'partial') {
        setCallStatus(prev => ({
          ...prev,
          activeTranscript: message.transcript
        }));
      }
    });

    vapi.on('error', (error: any) => {
      console.error('❌ Vapi: Error:', error);
      setCallStatus(prev => ({ 
        ...prev, 
        status: 'inactive', 
        isUserSpeaking: false, 
        assistantVolume: 0 
      }));
    });

    vapi.on('volume-level', (volume: number) => {
      setCallStatus(prev => ({ ...prev, assistantVolume: volume }));
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
      volumeTimeoutRef.current = setTimeout(() => {
        setCallStatus(prev => ({ ...prev, assistantVolume: 0 }));
      }, 200);
    });

    return () => {
      if (vapi) {
        console.log('🧹 Vapi: Limpiando conexión...');
        vapi.stop();
        if (volumeTimeoutRef.current) {
          clearTimeout(volumeTimeoutRef.current);
        }
      }
    };
  }, [config.publicKey]);

  const start = useCallback(async () => {
    if (!vapiRef.current) return;
    try {
      setCallStatus(prev => ({ ...prev, status: 'loading' }));
      const assistantId = config.assistantId || 
                         import.meta.env.VITE_VAPI_ASSISTANT_ID || 
                         '8a540a3e-e5f2-43c9-a398-723516f8bf80';
      console.log('🚀 Vapi: Iniciando llamada con Assistant ID:', assistantId);
      await vapiRef.current.start(assistantId);
    } catch (error) {
      console.error('❌ Vapi: Error al iniciar llamada:', error);
      setCallStatus(prev => ({ ...prev, status: 'inactive' }));
    }
  }, [config.assistantId]);

  const stop = useCallback(() => {
    if (!vapiRef.current) return;
    try {
      console.log('⏹️ Vapi: Deteniendo llamada manualmente');
      vapiRef.current.stop();
    } catch (error) {
      console.warn('⚠️ Vapi: Error al detener llamada (probablemente ya estaba desconectada):', error);
      setCallStatus(prev => ({ ...prev, status: 'inactive' }));
    }
  }, []);

  const toggleCall = useCallback(() => {
    if (callStatus.status === 'active' || callStatus.status === 'loading') {
      stop();
    } else {
      start();
    }
  }, [callStatus.status, start, stop]);

  return {
    isSessionActive: callStatus.status === 'active',
    isLoading: callStatus.status === 'loading',
    isUserSpeaking: callStatus.isUserSpeaking,
    assistantVolume: callStatus.assistantVolume,
    start,
    stop,
    toggleCall,
    messages: callStatus.messages,
    activeTranscript: callStatus.activeTranscript || ''
  };
};
