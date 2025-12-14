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
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    script: [],
                    participants: ["You", "Them"],
                    chatName: "Preview",
                    durationInFrames: 30 * 60, // Max duration for preview
                    participantColors: {} // Default empty object for safety
                }}
                calculateMetadata={({ props }) => ({
                    durationInFrames: props.durationInFrames || (30 * 60) // Use passed duration or default to 1 min
                })}
            />
        </>
    );
};

registerRoot(RemotionRoot);