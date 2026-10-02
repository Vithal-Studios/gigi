import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PasswordGateway from './components/PasswordGateway';
import CinematicWorld from './components/CinematicWorld';
import SunsetScene from './components/SunsetScene';
import DarknessScene from './components/DarknessScene';
import MoonInteraction from './components/MoonInteraction';
import FinalVideo from './components/FinalVideo';
import MusicPlayer from './components/MusicPlayer';
import { audioManager } from './utils/audioManager';

type Stage = 'password' | 'nyc' | 'sunset' | 'darkness' | 'moon' | 'finalVideo';

export default function App() {
  const [stage, setStage] = useState<Stage>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const stageParam = params.get('stage') as Stage;
      if (
        stageParam &&
        ['password', 'nyc', 'sunset', 'darkness', 'moon', 'finalVideo'].includes(stageParam)
      ) {
        return stageParam;
      }
    }
    return 'password';
  });

  // Synchronize global audio manager and reset scroll position with active story stage
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    audioManager.transitionToStage(stage);
  }, [stage]);

  const handlePasswordUnlock = useCallback(() => {
    audioManager.unlockAudio();
    setStage('nyc');
  }, []);

  const handleNycNext = useCallback(() => {
    setStage('sunset');
  }, []);

  const handleSunsetNext = useCallback(() => {
    setStage('darkness');
  }, []);

  const handleDarknessNext = useCallback(() => {
    setStage('moon');
  }, []);

  const handleMoonCaught = useCallback(() => {
    setStage('finalVideo');
  }, []);

  return (
    <div className="min-h-screen">
      {/* Minimal cinematic sound controller, active across story, paused during final video */}
      {stage !== 'finalVideo' && <MusicPlayer />}

      <AnimatePresence mode="wait">
        {stage === 'password' && (
          <motion.div
            key="password"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7 }}
          >
            <PasswordGateway onUnlock={handlePasswordUnlock} />
          </motion.div>
        )}

        {stage === 'nyc' && (
          <motion.div
            key="nyc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8 }}
          >
            <CinematicWorld onNext={handleNycNext} />
          </motion.div>
        )}

        {stage === 'sunset' && (
          <motion.div
            key="sunset"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.8 }}
          >
            <SunsetScene onNext={handleSunsetNext} />
          </motion.div>
        )}

        {stage === 'darkness' && (
          <motion.div
            key="darknessStage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            <DarknessScene onNext={handleDarknessNext} />
          </motion.div>
        )}

        {stage === 'moon' && (
          <motion.div
            key="moonStage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
          >
            <MoonInteraction onMoonCaught={handleMoonCaught} />
          </motion.div>
        )}

        {stage === 'finalVideo' && (
          <motion.div
            key="finalVideoStage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FinalVideo onReplayStory={() => setStage('password')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
