import React from 'react';
import {useState, useEffect} from 'react';
import {
    Button, Typography, Input,
} from 'antd';
import '../assets/App.css';
const AgoraWebRtc = require('../agorawebsdk');

const {Title, Paragraph} = Typography;

function App() {
    const [appId, setAppId] = useState('');
    const [channelName, setChannelName] = useState('');
    const [userId, setUserId] = useState();

    useEffect(() => {
    }, []);

    const joinOnClick = () => {
        AgoraWebRtc.join()
            .then(() => {
            }).catch((err) => {
                log.error(err);
            });
    };

    const leaveOnClick = () => {
        AgoraWebRtc.leave();
    };

    const renderHelper = () => {
        return (
            <div className="wrapper" style={{width: 500, marginTop: 16}}>
                <Input
                    placeholder="APP ID"
                    style={{width: 240, marginTop: 16}}
                    value={appId}
                    onChange={(event) => {
                        setAppId(event.target.value);
                    }}
                />
                <Input
                    placeholder="Channel Name"
                    style={{width: 240, marginTop: 16}}
                    value={channelName}
                    onChange={(event) => {
                        setChannelName(event.target.value);
                    }}
                />
                <Input
                    placeholder="User ID (Optional)"
                    style={{width: 240, marginTop: 16}}
                    value={userId}
                    onChange={(event) => {
                        setUserId(event.target.value);
                    }}
                />
                <Button
                    onClick={joinOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                >
                        Join
                </Button>

                <Button
                    danger
                    onClick={leaveOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                >
                        Leave
                </Button>
            </div>
        );
    };

    return (
        <div className="App">
            <div className="App-header">
                <Title>Agora Web SDK</Title>
                <Paragraph>This is a simple demo app shows how to use the official Agora WebSDK for live streaming.</Paragraph>
                {renderHelper()}
                <div
                    className='playerContainer'
                    id="playerContainer"
                >
                    <div
                        id="peerPlayer"
                        style={{width: 400, height: 400}}
                    />
                    <div
                        id="localPlayer"
                        style={{width: 400, height: 400}}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
