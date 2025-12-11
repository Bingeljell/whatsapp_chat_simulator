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
                durationInFrames={30 * 10}
                fps={30}
                width={400}
                height={800}
                defaultProps={{
                    script: [],
                    participants: ["You", "Them"],
                    chatName: "Preview"
                }}
            />
            <Composition
                id="ChatVideo-720p"
                component={ChatVideo}
                durationInFrames={30 * 10}
                fps={30}
                width={720}
                height={1280}
                defaultProps={{
                    script: [],
                    participants: ["You", "Them"],
                    chatName: "Preview"
                }}
            />
            <Composition
                id="ChatVideo-1080p"
                component={ChatVideo}
                durationInFrames={30 * 10}
                fps={30}
                width={1080}
                height={1920}
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
