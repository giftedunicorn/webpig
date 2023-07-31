import React from 'react';
import {useState, useEffect} from 'react';
import {
    Button, Typography, Input,
} from 'antd';
import * as log from 'loglevel';
import styles from '@/styles/App.module.css'
// import dynamic from "next/dynamic";
// const AgoraWebSdk = dynamic(() => import('../agorawebsdk'), { ssr: false });

const {Title, Paragraph} = Typography;

// console.log(AgoraWebSdk)

function App() {
    const [appId, setAppId] = useState('');
    const [channelName, setChannelName] = useState('');
    const [userId, setUserId] = useState();
    const [token, setToken] = useState('');

    const joinOnClick = async () => {
        const { join } = await import('../agorawebsdk')
        join(appId, channelName, null, null)
            .then(() => {
            }).catch((err) => {
                log.error(err);
            });
    };

    const leaveOnClick = async () => {
        const { leave } = await import('../agorawebsdk')
        leave()
    };

    const renderHelper = () => {
        return (
            <div className={styles.wrapper} style={{width: 500, marginTop: 16}}>
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
        <div className={styles.App}>
            <div className={styles['App-header']}>
                <Title>Agora Web SDK</Title>
                <Paragraph>This is a simple demo app shows how to use the official Agora WebSDK for live streaming.</Paragraph>
                {renderHelper()}
                <div
                    className={styles['playerContainer']}
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
