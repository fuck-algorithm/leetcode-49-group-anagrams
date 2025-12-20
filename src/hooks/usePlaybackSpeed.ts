import { useState, useEffect } from 'react';
import { getSavedPlaybackSpeed } from '../utils/playbackSpeed';

// 播放速度hook
export function usePlaybackSpeed() {
  const [speed, setSpeed] = useState(1);
  
  useEffect(() => {
    getSavedPlaybackSpeed().then(setSpeed);
  }, []);
  
  return [speed, setSpeed] as const;
}
