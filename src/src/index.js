import ReactDOM from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './assets/index.css';
import Home from './pages/Home';
import WebRtc from './pages/Webrtc';
import AgoraWebSdk from './pages/AgoraWebSdk';
import Mjpeg from './pages/Mjpeg';
import H265 from './pages/H265';
import reportWebVitals from './utils/reportWebVitals';
import * as log from 'loglevel';

// disable log for production
if (process.env.NODE_ENV === 'production') {
    log.disableAll();
} else {
    log.enableAll();
}
log.debug(process.env.NODE_ENV);

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/webrtc" element={<WebRtc />} />
                <Route path="/agorawebsdk" element={<AgoraWebSdk />} />
                <Route path="/mjpeg" element={<Mjpeg />} />
                <Route path="/h265" element={<H265 />} />
            </Routes>
        </BrowserRouter>
    );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(log.debug))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
