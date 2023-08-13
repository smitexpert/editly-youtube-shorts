import editly from 'editly';

const clips = [
  {
    duration: 6, transition: { name: 'fade' }, layers: [
      { type: 'video', path: './input/video.mp4', resizeMode: 'cover' },
      { type: 'subtitle', text: 'Komodo national park is the only home of the endangered Komodo dragons', start: 0, stop: 3 },
      { type: 'news-title', position: 'center', text: 'FACT', backgroundColor: 'rgba(0,0,0,0.5)' },
    ]
  }
]

const editSpec = {
  outPath: './outputs/video.mp4',
  width: 720,
  height: 1280,
  fps: 30,
  allowRemoteRequests: false,
  // audioFilePath: './input/audio.mp3',
  clips: clips,
  loopAudio: false,
  keepSourceAudio: false,
  clipsAudioVolume: 1,
  outputVolume: 1,
  audioTracks: [
    {
      path: './input/audio.mp3'
    },
    // ...more audio tracks
  ],
  audioNorm: {
    enable: true,
    gaussSize: 5,
    maxGain: 30,
  },

  // Testing options:
  enableFfmpegLog: false,
  verbose: false,
  fast: false,
}

// See editSpec documentation
await editly(editSpec)