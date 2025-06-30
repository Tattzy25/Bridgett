class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private recordingStartTime: number = 0;

  async startRecording(): Promise<void> {
    try {
      // Request microphone access with optimal settings
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100, // Higher sample rate for better quality
          channelCount: 1, // Mono recording
        },
      });

      // Get the best supported MIME type
      const mimeType = this.getBestSupportedMimeType();
      console.log(`Starting recording with MIME type: ${mimeType}`);

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // 128 kbps for good quality
      });

      this.audioChunks = [];
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        throw new Error('Recording failed due to MediaRecorder error');
      };

      this.mediaRecorder.start(250); // Collect data every 250ms for better responsiveness
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      this.cleanup();
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Microphone access denied. Please allow microphone permissions and try again.');
        } else if (error.name === 'NotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (error.name === 'NotReadableError') {
          throw new Error('Microphone is being used by another application. Please close other apps and try again.');
        } else if (error.name === 'OverconstrainedError') {
          throw new Error('Microphone does not support the required settings. Please try with a different microphone.');
        }
      }
      
      throw new Error('Failed to start audio recording. Please check microphone permissions and try again.');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording to stop'));
        return;
      }

      const recordingDuration = Date.now() - this.recordingStartTime;
      console.log(`Recording duration: ${recordingDuration}ms`);

      // Check minimum recording duration (at least 500ms)
      if (recordingDuration < 500) {
        this.cleanup();
        reject(new Error('Recording too short. Please speak for at least 1 second.'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          if (this.audioChunks.length === 0) {
            reject(new Error('No audio data recorded. Please try speaking again.'));
            return;
          }

          const mimeType = this.mediaRecorder?.mimeType || this.getBestSupportedMimeType();
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });

          console.log(`Recording stopped. Audio blob: ${audioBlob.size} bytes, type: ${audioBlob.type}`);

          if (audioBlob.size === 0) {
            reject(new Error('No audio data recorded. Please check your microphone and try again.'));
            return;
          }

          // Check minimum file size (at least 1KB)
          if (audioBlob.size < 1024) {
            reject(new Error('Audio recording is too small. Please speak louder and longer.'));
            return;
          }

          this.cleanup();
          resolve(audioBlob);
        } catch (error) {
          console.error('Error creating audio blob:', error);
          this.cleanup();
          reject(new Error('Failed to process audio recording. Please try again.'));
        }
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder stop error:', event);
        this.cleanup();
        reject(new Error('Recording error occurred while stopping'));
      };

      // Add timeout for stop operation
      const stopTimeout = setTimeout(() => {
        console.error('Stop recording timeout');
        this.cleanup();
        reject(new Error('Recording stop operation timed out'));
      }, 5000);

      this.mediaRecorder.addEventListener('stop', () => {
        clearTimeout(stopTimeout);
      }, { once: true });

      try {
        this.mediaRecorder.stop();
      } catch (error) {
        clearTimeout(stopTimeout);
        console.error('Error stopping MediaRecorder:', error);
        this.cleanup();
        reject(new Error('Failed to stop recording'));
      }
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }

  private getBestSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm;codecs=vp8,opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/wav',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        console.log(`Selected MIME type: ${type}`);
        return type;
      }
    }

    console.warn('No optimal MIME type supported, using fallback');
    return 'audio/webm'; // Fallback
  }

  private cleanup(): void {
    console.log('Cleaning up audio recorder');
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped track: ${track.kind}`);
      });
      this.stream = null;
    }
    
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (error) {
        console.warn('Error stopping MediaRecorder during cleanup:', error);
      }
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.recordingStartTime = 0;
  }

  // Public method to manually cleanup if needed
  public dispose(): void {
    this.cleanup();
  }
}

export default AudioRecorder;