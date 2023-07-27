const debug = require('debug')(`${process.env.APPNAME}:wss`);
const WebSocket = require('ws');
let channels = {}

function init (port) {
    debug('ws init invoked, port:', port)

    const wss = new WebSocket.Server({ port });
    wss.on('connection', (socket) => {
        debug('A client has connected!');
        
        socket.on('error', debug);
        socket.on('message', message => onMessage(wss, socket, message));
        socket.on('close', message => onClose(wss, socket, message));
    })
}

function send(wsClient, type, body) {
    debug('ws send', body);
    wsClient.send(JSON.stringify({
        type,
        body,
    }))
}

function clearClient(wss, socket) {
    // clear all client
    // channels = {}
    Object.keys(channels).forEach((cname) => {
        Object.keys(channels[cname]).forEach((uid) => {
            if (channels[cname][uid] === socket) {
                delete channels[cname][uid]
            }
        })
    })
}

function onMessage(wss, socket, message) {
    debug(`onMessage ${message}`);

    const parsedMessage = JSON.parse(message)
    const type = parsedMessage.type
    const body = parsedMessage.body
    const channelName = body.channelName
    const userId = body.userId
    
    switch (type) {
        case 'join': {
            // join channel
            if (channels[channelName]) {
                channels[channelName][userId] = socket
            } else {
                channels[channelName] = {}
                channels[channelName][userId] = socket
            }
            const userIds = Object.keys(channels[channelName])
            send(socket, 'joined', userIds)
            break;
        }
        case 'quit': {
            // quit channel
            if (channels[channelName]) {
                channels[channelName][userId] = null
                const userIds = Object.keys(channels[channelName])
                if (userIds.length === 0) {
                    delete channels[channelName]
                }
            }
            break;
        }
        case 'send_offer': { 
            // exchange sdp to peer 
            const sdp = body.sdp
            let userIds = Object.keys(channels[channelName])
            userIds.forEach(id => {
                if (userId.toString() !== id.toString()) {
                    const wsClient = channels[channelName][id]
                    send(wsClient, 'offer_sdp_received', sdp)
                }
            })
            break;
        }
        case 'send_answer': { 
            // exchange sdp to peer 
            const sdp = body.sdp
            let userIds = Object.keys(channels[channelName])
            userIds.forEach(id => {
                if (userId.toString() !== id.toString()) {
                    const wsClient = channels[channelName][id]
                    send(wsClient, 'answer_sdp_received', sdp)
                }
            })
            break;
        }
        case 'send_ice_candidate': {
            const candidate = body.candidate
            let userIds = Object.keys(channels[channelName])
            userIds.forEach(id => {
                if (userId.toString() !== id.toString()) {
                    const wsClient = channels[channelName][id]
                    send(wsClient, 'ice_candidate_received', candidate)
                }
            })
        }
        default:
            break;
    }

    // // Send message back to all clients connected
    // wss.clients.forEach(client => {
    //     if (client !== socket && client.readyState === WebSocket.OPEN) {
    //         client.send(message, { binary: isBinary });
    //     }
    // });
}

function onClose(wss, socket, message) {
    debug('onClose', message);
    clearClient(wss, socket)
}

module.exports = {
    init,
}