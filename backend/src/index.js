import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import { ChatVideo } from './ChatVideo.jsx';
import './style.css';

export const RemotionRoot = () => {
    return (
        <>
            <Composition
                id="ChatVideo"
                component={ChatVideo}
                durationInFrames={30 * 10} // Default duration, overridden by server
                fps={30}
                width={720} // Mobile width
                height={1280} // Mobile height
                defaultProps={{
                    script: [],
                    participants: ["You", "Them"],
                    chatName: "Preview"
                }}
            />
        </>
    );
};

registerRoot(RemotionRoot);
