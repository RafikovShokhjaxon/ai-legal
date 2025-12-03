import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { VOICE_MODEL, SYSTEM_INSTRUCTION } from "../constants";
import { createPcmData, encode } from "./liveServiceUtils";

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private sessionPromise: Promise<any> | null = null;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  
  public onVolumeChange: ((vol: number) => void) | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(onClose: () => void) {
    // Reset state
    this.nextStartTime = 0;
    this.activeSources.clear();

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const outputNode = this.outputAudioContext.createGain();
    outputNode.connect(this.outputAudioContext.destination);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    this.sessionPromise = this.ai.live.connect({
      model: VOICE_MODEL,
      callbacks: {
        onopen: () => {
          console.log("Live Session Opened");
          this.startInputStream(stream);
        },
        onmessage: async (message: LiveServerMessage) => {
          this.handleMessage(message, outputNode);
        },
        onclose: () => {
          console.log("Live Session Closed");
          onClose();
        },
        onerror: (err) => {
          console.error("Live Session Error", err);
          onClose();
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: SYSTEM_INSTRUCTION,
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
        }
      }
    });
  }

  private startInputStream(stream: MediaStream) {
    if (!this.inputAudioContext) return;
    
    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      
      // Calculate volume for visualizer
      let sum = 0;
      for (let i=0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
      const rms = Math.sqrt(sum / inputData.length);
      if(this.onVolumeChange) this.onVolumeChange(rms);

      const pcmBlob = createPcmData(inputData);
      
      this.sessionPromise?.then(session => {
        session.sendRealtimeInput({ 
          media: pcmBlob
        });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage, outputNode: AudioNode) {
      const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (base64Audio && this.outputAudioContext) {
        this.nextStartTime = Math.max(this.nextStartTime, this.outputAudioContext.currentTime);
        
        try {
            const audioBuffer = await decodeAudioData(
                decode(base64Audio), 
                this.outputAudioContext, 
                24000, 
                1
            );
            
            const source = this.outputAudioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputNode);
            
            source.addEventListener('ended', () => {
                this.activeSources.delete(source);
            });
            
            source.start(this.nextStartTime);
            this.nextStartTime += audioBuffer.duration;
            this.activeSources.add(source);
        } catch (e) {
            console.error("Error decoding audio", e);
        }
      }

      const interrupted = message.serverContent?.interrupted;
      if (interrupted) {
          this.activeSources.forEach(s => s.stop());
          this.activeSources.clear();
          this.nextStartTime = 0;
      }
  }

  async disconnect() {
    this.sessionPromise?.then(session => {
        // @ts-ignore
        if(session.close) session.close();
    });

    if (this.processor && this.inputSource) {
        this.processor.disconnect();
        this.inputSource.disconnect();
    }
    
    if (this.inputAudioContext) await this.inputAudioContext.close();
    if (this.outputAudioContext) await this.outputAudioContext.close();

    this.activeSources.forEach(s => s.stop());
    
    this.inputAudioContext = null;
    this.outputAudioContext = null;
    this.activeSources.clear();
    this.sessionPromise = null;
  }
}
