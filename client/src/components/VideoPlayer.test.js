import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import VideoPlayer from './VideoPlayer';

describe('VideoPlayer component', () => {
    const dummyVideo = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
    test('renders video element and title', () => {
        const { container } = render(
            <VideoPlayer
                videoUrl={dummyVideo}
                title="Test Video"
                poster=""
                onClose={() => { }}
                autoPlay={false}
                showControls={true}
            />
        );
        // Title should be visible
        expect(screen.getByText('Test Video')).toBeInTheDocument();
        // Video element should be in the document
        const videoEl = container.querySelector('video');
        expect(videoEl).toBeInTheDocument();
    });
});
