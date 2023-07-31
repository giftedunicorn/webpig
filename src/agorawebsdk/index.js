import AgoraRTC from 'agora-rtc-sdk-ng';
import * as log from 'loglevel';

AgoraRTC.setLogLevel(4);
const currentVideoCodec = 'h264';
const currentRtcMode = 'rtc';

const rtc = {
    localAudioTrack: null,
    localVideoTrack: null,
    client: null,
};

async function initRtc() {
    log.debug('initRtc Invoked');

    rtc.client = new AgoraRTC.createClient({ mode: currentRtcMode, codec: currentVideoCodec });

    rtc.client.on('user-published', async (user, mediaType) => {
    // Subscribe to the remote user when the SDK triggers the "user-published" event
        await rtc.client.subscribe(user, mediaType);
        log.debug('user published', user);

        const peerPlayerContainer = document.getElementById('peerPlayer');

        // If the remote user publishes a video track.
        if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            remoteVideoTrack.play(peerPlayerContainer);
        }

        // If the remote user publishes an audio track.
        if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();
        }
    });

    // Listen for the "user-left" event
    rtc.client.on('user-left', (user) => {
        log.debug('user left channel', user);
    });

    // Listen for the "user-unpublished" event
    rtc.client.on('user-unpublished', (user) => {
        log.debug('user unpublished', user);
    });
}

async function joinChannel(appId, channel, token, agoraUid) {
    log.debug('joinChannel Invoked');

    log.debug('CHANNEL NAME:', channel);
    log.debug('AGORA UID:', agoraUid);
    log.debug('AGORA TOKEN:', token);

    // agora uid must be int
    const parsedUid = parseInt(agoraUid);

    await rtc.client.join(appId, channel, token, parsedUid);

    log.debug('join success!');
}

async function publishMedia() {
    log.debug('publishMedia success!');

    // Create a local audio track from the audio sampled by a microphone.
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    // Create a local video track from the video captured by a camera.
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

    // Publish the local audio and video tracks to the RTC channel.
    await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);

    const localPlayerContainer = document.getElementById('localPlayer');
    rtc.localVideoTrack.play(localPlayerContainer);

    log.debug('publish success!');
}

async function destroyRtc() {
    log.debug('destroyRtc Invoked');

    if (rtc.localAudioTrack) rtc.localAudioTrack.close();
    if (rtc.localVideoTrack) rtc.localVideoTrack.close();

    // Leave the channel.
    if (rtc.client) await rtc.client.leave();

    rtc.localAudioTrack = null;
    rtc.localVideoTrack = null;
    rtc.client = null;
}

export async function join(channelName, token, uid) {
    log.debug('join Invoked');
    // everything in this branch only runs in the browser
    await initRtc();
    await joinChannel(channelName, token, uid);
    await publishMedia();
}

export function leave() {
    log.debug('leave Invoked');
    destroyRtc();
}
