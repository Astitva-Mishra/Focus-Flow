import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, Repeat } from 'lucide-react';

interface SoundOption {
  id: string;
  name: string;
  url: string;
  icon: string;
}

const soundOptions: SoundOption[] = [
  { id: 'rain', name: 'Rain', url: './white sounds/light-rain-109591.mp3', icon: '🌧️' },
  { id: 'waves', name: 'Ocean Waves', url: './white sounds/ocean-waves-250310.mp3', icon: '🌊' },
  { id: 'forest', name: 'Forest', url: './white sounds/forest-163012.mp3', icon: '🌳' },
  { id: 'whitenoise', name: 'White Noise', url: './white sounds/waves-white-noise-9777.mp3', icon: '🌫️' },
  { id: 'fireplace', name: 'Fireplace', url: './white sounds/fireplace-crackling.mp3', icon: '🔥' },
  { id: 'wind', name: 'Wind', url: './white sounds/soft-wind.mp3', icon: '💨' }
];

const WhiteNoise: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [volume, setVolume] = useState(0.5);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [isLooping, setIsLooping] = useState(true);
  const [progress, setProgress] = useState(0);

  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [audio]);

  useEffect(() => {
    if (audio) {
      const updateProgress = () => {
        if (audio.duration > 0) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [audio]);

  const playSound = (index: number) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    if (activeIndex === index) {
      setActiveIndex(null);
      setAudio(null);
      setProgress(0);
      return;
    }

    const sound = soundOptions[index];
    const newAudio = new Audio(sound.url);
    newAudio.loop = isLooping;
    newAudio.volume = volume;
    newAudio.play();
    setAudio(newAudio);
    setActiveIndex(index);
    setProgress(0);
  };

  const playNext = () => {
    if (activeIndex === null) return;
    const nextIndex = (activeIndex + 1) % soundOptions.length;
    playSound(nextIndex);
  };

  const playPrevious = () => {
    if (activeIndex === null) return;
    const prevIndex = (activeIndex - 1 + soundOptions.length) % soundOptions.length;
    playSound(prevIndex);
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
    if (audio) {
      audio.loop = !isLooping;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audio) {
      audio.volume = newVolume;
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (audio && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const newProgress = (offsetX / rect.width) * 100;
      audio.currentTime = (newProgress / 100) * audio.duration;
      setProgress(newProgress);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Focus Sounds</h1>

        {/* Volume Control */}
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            {volume === 0 ? <VolumeX className="w-6 h-6 text-gray-600 dark:text-gray-400" /> : <Volume2 className="w-6 h-6 text-gray-600 dark:text-gray-400" />}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Sound Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
          {soundOptions.map((sound, index) => (
            <button
              key={sound.id}
              onClick={() => playSound(index)}
              className={`p-6 rounded-lg shadow-md transition-all duration-300 ${
                activeIndex === index ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <span className="text-4xl">{sound.icon}</span>
                <span className="font-medium">{sound.name}</span>
                {activeIndex === index ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </div>
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        {audio && (
          <div className="mt-6 bg-gray-200 dark:bg-gray-700 h-2 rounded-lg cursor-pointer" ref={progressRef} onClick={handleSeek}>
            <div className="h-full bg-blue-500 rounded-lg transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        )}

        {/* Playback Controls */}
        <div className="mt-8 flex justify-center space-x-6">
          <button onClick={playPrevious} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
            <SkipBack className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
          <button onClick={toggleLoop} className={`p-3 rounded-full ${isLooping ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
            <Repeat className="w-6 h-6" />
          </button>
          <button onClick={playNext} className="p-3 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600">
            <SkipForward className="w-6 h-6 text-gray-900 dark:text-white" />
          </button>
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Focus Tips</h2>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li>• Use ambient sounds to mask distracting background noise</li>
            <li>• Keep the volume at a comfortable, non-intrusive level</li>
            <li>• Experiment with different sounds to find what works best for you</li>
            <li>• Take regular breaks to prevent listening fatigue</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WhiteNoise;
