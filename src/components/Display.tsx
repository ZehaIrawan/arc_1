import React from 'react';
// eslint-disable-next-line import/extensions
import {
  BigPlayButton, ClosedCaptionButton, ControlBar, Player,
} from 'video-react';
import 'video-react/dist/video-react.css';
import video from '../videos/airline.mp4';
// import subtitle from '../videos/airline.srt'

function Display() {
  return (
    <div>
      <h1>Display</h1>
      <div className="w-1/2">
        <Player
          playsInline
        >
          <BigPlayButton position="center" className="hidden" />
          <source src={video} />

          <track
            kind="captions"
            src="/airline.vtt"
            srcLang="en"
            label="English"
            default
          />
          <ControlBar autoHide={false}>
            <ClosedCaptionButton order={7} />
          </ControlBar>
        </Player>
      </div>
    </div>
  );
}

export default Display;
