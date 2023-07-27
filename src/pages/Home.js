import React from 'react';
import {
    Button, Typography, Card,
} from 'antd';
import {useNavigate} from 'react-router-dom';
import '../assets/App.css';

const {Title, Paragraph} = Typography;

function App() {
    const navigate = useNavigate();
    const openWebrtc = () => navigate('/webrtc');
    const openAgorawebsdk = () => navigate('/agorawebsdk');
    const openMjpeg = () => navigate('/mjpeg');

    const renderHelper = () => {
        return (
            <div className="container wrapper-row">
                <Card style={{margin: 8, width: 500, height: 250}}>
                    <Title>Agora WebSDK</Title>
                    <Paragraph>Start RTC with the Agora official WebSDK</Paragraph>
                    <Button
                        type="primary"
                        onClick={openAgorawebsdk}
                    >
                        Start
                    </Button>
                </Card>
                <Card style={{margin: 8, width: 500, height: 250}}>
                    <Title>WebRTC</Title>
                    <Paragraph>Start RTC with the native WebRTC protocol</Paragraph>
                    <Button
                        type="primary"
                        onClick={openWebrtc}
                    >
                        Start
                    </Button>
                </Card>
                <Card style={{margin: 8, width: 500, height: 250}}>
                    <Title>mJpeg on Web</Title>
                    <Paragraph>Play mJpeg video stream on browser with WebSDK</Paragraph>
                    <Button
                        type="primary"
                        onClick={openMjpeg}
                    >
                        Start
                    </Button>
                </Card>
                <Card style={{margin: 8, width: 500, height: 250}}>
                    <Title>H265 on Web</Title>
                    <Paragraph>Play h265 video stream on browser with WebSDK</Paragraph>
                    <Button
                        type="primary"
                        onClick={openMjpeg}
                    >
                        Start
                    </Button>
                </Card>
            </div>
        );
    };

    return (
        <div className="App">
            <div className="App-header">
                {renderHelper()}
            </div>
        </div>
    );
}

export default App;
