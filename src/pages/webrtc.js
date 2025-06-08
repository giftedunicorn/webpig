import {useRef, useState, useEffect} from 'react';
import {Button, Typography, Input} from 'antd';
import styles from '@/styles/App.module.css'
import * as log from 'loglevel';

const {Title, Paragraph} = Typography;
const {TextArea} = Input;

const URL_WEB_SOCKET = process.env.NEXT_PUBLIC_WEB_SOCKET;
let localStream;
let localPeerConnection;
let sendChannel;
let receiveChannel;

const servers = {'iceServers': [
	{url: 'stun:stun01.sipphone.com'},
    {url: 'stun:stun.ekiga.net'},
    {url: 'stun:stun.fwdnet.net'},
    {url: 'stun:stun.ideasip.com'},
    {url: 'stun:stun.iptel.org'},
    {url: 'stun:stun.rixtelecom.se'},
    {url: 'stun:stun.schlund.de'},
    {url: 'stun:stun.l.google.com:19302'},
    {url: 'stun:stun1.l.google.com:19302'},
    {url: 'stun:stun2.l.google.com:19302'},
    {url: 'stun:stun3.l.google.com:19302'},
    {url: 'stun:stun4.l.google.com:19302'},
    {url: 'stun:stunserver.org'},
    {url: 'stun:stun.softjoys.com'},
    {url: 'stun:stun.voiparound.com'},
    {url: 'stun:stun.voipbuster.com'},
    {url: 'stun:stun.voipstunt.com'},
    {url: 'stun:stun.voxgratia.org'},
    {url: 'stun:stun.xten.com'},
	
    // {
    //     url: 'turn:numb.viagenie.ca',
    //     credential: 'muazkh',
    //     username: 'webrtc@live.com',
    // },
    // {
    //     url: 'turn:192.158.29.39:3478?transport=udp',
    //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    //     username: '28224511:1379330808',
    // },
    // {
    //     url: 'turn:192.158.29.39:3478?transport=tcp',
    //     credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
    //     username: '28224511:1379330808',
    // },
]};
const pcConstraints = {
    'optional': [
        {'DtlsSrtpKeyAgreement': true},
    ],
};

function App() {
    const [startButtonDisabled, setStartButtonDisabled] = useState(true);
    const [joinButtonDisabled, setJoinButtonDisabled] = useState(true);
    const [callButtonDisabled, setCallButtonDisabled] = useState(true);
    const [hangupButtonDisabled, setHangupButtonDisabled] = useState(true);
    const [sendButtonDisabled, setSendButtonDisabled] = useState(true);
    const [sendMessage, setSendMessage] = useState('');
    const [receiveMessage, setReceiveMessage] = useState('');
    const [channelName, setChannelName] = useState('');
    const [userId, setUserId] = useState(Math.floor(Math.random() * 1000000));
    const [renderLocalStream, setRenderLocalStream]= useState(false);
    const ws = useRef(null);

    useEffect(() => {
        const wsClient = new WebSocket(URL_WEB_SOCKET);
        ws.current = wsClient;

        wsClient.onopen = () => {
            log.debug('ws opened');
            setStartButtonDisabled(false)
        };

        wsClient.onclose = () => log.debug('ws closed');

        return () => {
            wsClient.close();
        };
    }, []);

    useEffect(() => {
        ws.current.onmessage = (message) => {
            log.debug('ws message received', message.data);
            const parsedMessage = JSON.parse(message.data);
            switch (parsedMessage.type) {
            case 'joined': {
                const body = parsedMessage.body;
                log.debug('users in this channel', body);
                break;
            }
            case 'offer_sdp_received': {
                const offer = parsedMessage.body;
                onAnswer(offer);
                break;
            }
            case 'answer_sdp_received': {
                gotRemoteDescription(parsedMessage.body);
                break;
            }
            case 'quit': {
                break;
            }
            default:
                break;
            }
        };
    }, [channelName, userId]);

    const sendWsMessage = (type, body) => {
        log.debug('sendWsMessage invoked', type, body);
        ws.current.send(JSON.stringify({
            type,
            body,
        }));
    };

    const start = () => {
        log.debug('start invoked');

        setStartButtonDisabled(true);
        setJoinButtonDisabled(false);

        navigator.getUserMedia({audio: true, video: true}, (stream) => {
            log.debug('getUserMedia invoked', stream);
            // render local stream on DOM
            if (renderLocalStream) {
                const localPlayer = document.getElementById('localPlayer');
                localPlayer.srcObject = stream;
            }
            localStream = stream;
        }, (error) => {
            log.error('getUserMedia error:', error);
        });
    };

    const join = () => {
        log.debug('join invoked');

        if (!channelName) {
            log.error('channelName is empty');
            alert('channelName is empty');
            return;
        }

        if (!userId) {
            log.error('userId is empty');
            alert('userId is empty');
            return;
        }

        setJoinButtonDisabled(true);
        setCallButtonDisabled(false);

        sendWsMessage('join', {
            channelName,
            userId,
        });
    };

    const callOnClick = () => {
        log.debug('callOnClick invoked');

        setCallButtonDisabled(true);
        setHangupButtonDisabled(false);

        if (localStream.getVideoTracks().length > 0) {
            log.debug(`Using video device: ${localStream.getVideoTracks()[0].label}`);
        }
        if (localStream.getAudioTracks().length > 0) {
            log.debug(`Using audio device: ${localStream.getAudioTracks()[0].label}`);
        }

        log.debug('new RTCPeerConnection for local');
        localPeerConnection = new RTCPeerConnection(servers, pcConstraints);
        log.debug('setup gotLocalIceCandidateOffer');
        localPeerConnection.onicecandidate = gotLocalIceCandidateOffer;

        log.debug('setup gotRemoteStream');
        localPeerConnection.onaddstream = gotRemoteStream;

        // create data channel before exchange sdp
        createDataChannel();

        log.debug('localPeerConnection.addStream invoked');
        localPeerConnection.addStream(localStream);
        log.debug('localPeerConnection.createOffer invoked');
        localPeerConnection.createOffer().then(gotLocalDescription);
    };

    const hangupOnClick = () => {
        log.debug('hangupOnClick invoked');
        closeDataChannel();
        localPeerConnection.close();
        localPeerConnection = null;
        setHangupButtonDisabled(true);
        setCallButtonDisabled(false);
    };

    const sendOnClick = () => {
        log.debug('sendOnClick invoked', sendMessage);
        sendChannel.send(sendMessage);
        setSendMessage('');
    };

    const onAnswer = (offer) => {
        log.debug('onAnswer invoked');
        setCallButtonDisabled(true);
        setHangupButtonDisabled(false);

        if (localStream.getVideoTracks().length > 0) {
            log.debug(`Using video device: ${localStream.getVideoTracks()[0].label}`);
        }
        if (localStream.getAudioTracks().length > 0) {
            log.debug(`Using audio device: ${localStream.getAudioTracks()[0].label}`);
        }

        log.debug('new RTCPeerConnection for local');
        localPeerConnection = new RTCPeerConnection(servers, pcConstraints);
        log.debug('setup gotLocalIceCandidateAnswer');
        localPeerConnection.onicecandidate = gotLocalIceCandidateAnswer;

        log.debug('setup gotRemoteStream');
        localPeerConnection.onaddstream = gotRemoteStream;

        createDataChannel();

        log.debug('localPeerConnection.addStream invoked');
        localPeerConnection.addStream(localStream);

        localPeerConnection.setRemoteDescription(offer);
        localPeerConnection.createAnswer().then(gotAnswerDescription);
    };

    const createDataChannel = () => {
        try {
            log.debug('localPeerConnection.createDataChannel invoked');
            sendChannel = localPeerConnection.createDataChannel('sendDataChannel', {reliable: true});
        } catch (error) {
            log.error('localPeerConnection.createDataChannel failed', error);
        }

        log.debug('setup handleSendChannelStateChange');
        sendChannel.onopen = handleSendChannelStateChange;
        sendChannel.onClose = handleSendChannelStateChange;

        log.debug('setup localPeerConnection.ondatachannel');
        localPeerConnection.ondatachannel = gotReceiveChannel;
    };

    const closeDataChannel = () => {
        log.debug('closeDataChannel invoked');
        sendChannel && sendChannel.close();
        receiveChannel && receiveChannel.close();
        setSendButtonDisabled(true);
    };

    const gotLocalDescription = (offer) => {
        log.debug('gotLocalDescription invoked:', offer);
        localPeerConnection.setLocalDescription(offer);
    };

    const gotAnswerDescription = (answer) => {
        log.debug('gotAnswerDescription invoked:', answer);
        localPeerConnection.setLocalDescription(answer);
    };

    const gotRemoteDescription = (answer) => {
        log.debug('gotRemoteDescription invoked:', answer);
        localPeerConnection.setRemoteDescription(answer);
    };

    const gotRemoteStream = (event) => {
        log.debug('gotRemoteStream invoked');
        const remotePlayer = document.getElementById('peerPlayer');
        remotePlayer.srcObject = event.stream;
    };

    const gotLocalIceCandidateOffer = (event) => {
        log.debug('gotLocalIceCandidateOffer invoked', event.candidate, localPeerConnection.localDescription);

        if (!channelName) {
            log.error('channelName is empty');
            alert('channelName is empty');
            return;
        }

        if (!userId) {
            log.error('userId is empty');
            alert('userId is empty');
            return;
        }

        // gathering candidate finished, send complete sdp
        if (!event.candidate) {
            const offer = localPeerConnection.localDescription;
            sendWsMessage('send_offer', {
                channelName,
                userId,
                sdp: offer,
            });
        }
    };

    const gotLocalIceCandidateAnswer = (event) => {
        log.debug('gotLocalIceCandidateAnswer invoked', event.candidate, localPeerConnection.localDescription);

        if (!channelName) {
            log.error('channelName is empty');
            alert('channelName is empty');
            return;
        }

        if (!userId) {
            log.error('userId is empty');
            alert('userId is empty');
            return;
        }

        // gathering candidate finished, send complete sdp
        if (!event.candidate) {
            const answer = localPeerConnection.localDescription;
            sendWsMessage('send_answer', {
                channelName,
                userId,
                sdp: answer,
            });
        }
    };

    const gotReceiveChannel = (event) => {
        log.debug('gotReceiveChannel invoked');
        receiveChannel = event.channel;
        receiveChannel.onmessage = handleMessage;
        receiveChannel.onopen = handleReceiveChannelStateChange;
        receiveChannel.onclose = handleReceiveChannelStateChange;
    };

    const handleMessage = (event) => {
        log.debug('handleMessage invoked', event.data);
        setReceiveMessage(event.data);
        setSendMessage('');
    };

    const handleSendChannelStateChange = () => {
        const readyState = sendChannel.readyState;
        log.debug('handleSendChannelStateChange invoked', readyState);
        if (readyState === 'open') {
            setSendButtonDisabled(false);
        } else {
            setSendButtonDisabled(true);
        }
    };

    const handleReceiveChannelStateChange = () => {
        const readyState = receiveChannel.readyState;
        log.debug('handleReceiveChannelStateChange invoked', readyState);
    };

    const renderHelper = () => {
        return (
            <div className={styles.wrapper}>
                <Input
                    placeholder="User ID"
                    style={{width: 240, marginTop: 16}}
                    value={userId}
                    onChange={(event) => {
                        setUserId(event.target.value);
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
                <Button
                    onClick={start}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={startButtonDisabled}
                >
                    Start
                </Button>
                <Button
                    onClick={join}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={joinButtonDisabled}
                >
                    Join
                </Button>
                <Button
                    onClick={callOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={callButtonDisabled}
                >
                    Call
                </Button>
                <Button
                    danger
                    onClick={hangupOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={hangupButtonDisabled}
                >
                    Hangup
                </Button>
            </div>
        );
    };

    const renderTextarea = () => {
        return (
            <div className={styles.wrapper}>
                <TextArea
                    onChange={(e) => {
                        setSendMessage(e.target.value);
                    }}
                    style={{width: 240, marginTop: 16}}
                    value={sendMessage}
                    placeholder='Send message'
                />
                <TextArea
                    style={{width: 240, marginTop: 16}}
                    value={receiveMessage}
                    placeholder='Receive message'
                    disabled
                />
                <Button
                    onClick={sendOnClick}
                    style={{width: 240, marginTop: 16}}
                    type="primary"
                    disabled={sendButtonDisabled}
                >
                    Send Message
                </Button>
            </div>
        );
    };

    return (
        <div className={styles.App}>
            <div className={styles['App-header']}>
                <Title>WebRTC</Title>
                <Paragraph>This is a simple demo app shows how to build a WebRTC app with a signaling server from scratch.</Paragraph>
                <div className={styles['wrapper-row']} style={{justifyContent: 'space-evenly', width: '50%'}}>
                    {renderHelper()}
                    {renderTextarea()}
                </div>
                <div
                    className={styles.playerContainer}
                    id="playerContainer"
                >
                    <video
                        id="peerPlayer"
                        autoPlay
                        style={{width: 640, height: 480}}
                    />
{/*                     <video
                        id="localPlayer"
                        autoPlay
                        style={{width: 640, height: 480}}
                    /> */}
                </div>
            </div>
        </div>
    );
}

export default App;
