import { useEffect } from 'react';
import SunsetScrollSequence from './SunsetScrollSequence';
import SunsetOverlay from './SunsetOverlay';
import SunsetText from './SunsetText';
import { audioManager } from '../utils/audioManager';

interface SunsetSceneProps {
  onNext?: () => void;
}

export default function SunsetScene({ onNext }: SunsetSceneProps) {
  useEffect(() => {
    // Scroll smoothly to top when entering the sunset stage
    window.scrollTo({ top: 0, behavior: 'instant' });
    audioManager.transitionToStage('sunset');
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#08060c] text-white">
      <SunsetScrollSequence>
        {(progress) => (
          <div className="relative w-full h-full overflow-hidden">
            {/* Visual Atmosphere & Stars */}
            <SunsetOverlay progress={progress} />

            {/* Narrative Story Typography & Final CTA Button */}
            <SunsetText progress={progress} onNext={onNext} />
          </div>
        )}
      </SunsetScrollSequence>
    </div>
  );
}
