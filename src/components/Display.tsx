import React from 'react';
// eslint-disable-next-line import/extensions
import { BigPlayButton, Player, ControlBar } from 'video-react';
import 'video-react/dist/video-react.css';
import video from '../videos/airline.mp4';

function Display() {
  return (
    <div>
      <h1>Display</h1>
      <div className="w-1/2">
        <Player playsInline>
          <BigPlayButton position="center" className="hidden" />
          <source src={video} />
          <ControlBar autoHide={false} />
        </Player>
      </div>
    </div>
  );
}

export default Display;
