import React from 'react';
// eslint-disable-next-line import/extensions
import {
  BigPlayButton, ClosedCaptionButton, ControlBar, Player,
} from 'video-react';
import 'video-react/dist/video-react.css';

function Display() {
  return (
    <div>
      <h1>Display</h1>
      <div className="w-1/2">
        <Player
          playsInline
        >
          <BigPlayButton position="center" className="hidden" />
          <source src="https://firebasestorage.googleapis.com/v0/b/suboto.appspot.com/o/china.mp4?alt=media&token=e852e3c3-0a00-462a-a2a9-29d813cf2fef" />

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
