import { useRouter } from 'next/router'
import {
    Button, Typography, Card,
} from 'antd';
import styles from '@/styles/App.module.css'

const {Title, Paragraph} = Typography;

function App() {
    const router = useRouter()
    const openWebrtc = () => {
        router.push({
            pathname: `/webrtc`,
        })
    }

    const openAgorawebsdk = () => {
        router.push({
            pathname: `/agorawebsdk`,
        })
    }

    const openMjpeg = () => {
        router.push({
            pathname: `/mjpeg`,
        })
    }

    const renderHelper = () => {
        return (
            <div className={`${styles.container} ${styles['wrapper-row']}`}>
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
        <div className={styles.App}>
            <div className={styles["App-header"]}>
                {renderHelper()}
            </div>
        </div>
    );
}

export default App;
