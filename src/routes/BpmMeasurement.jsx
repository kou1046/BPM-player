import { useEffect, useRef, useState } from "react";
import { CheckBpmBtn } from "../components/CheckBpmBtn";
import { ContentsList } from "../components/ContentsList";
import style from './BpmMeasurement.module.scss';
import axios, { AxiosError } from "axios";
import { PlayBtn } from "../components/PlayBtn";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export const BpmMeasurement = ({ token, artists, tracks }) => {
    const [bpmHistory, setBpmHistory] = useState([]);
    const [bpmTrack, setBpmTrack] = useState([]);
    const [limitPushCnt, setLimitPushCnt] = useState(3);
    const [resultBpm, setResultBpm] = useState(0);
    const trackAreaRef = useRef(null);
    const autoPlayRef = useRef(null);
    const shuffleRef = useRef(null);
    const bpm = bpmHistory.length ? Math.round(bpmHistory.reduce((prev, cur) => prev + cur) / bpmHistory.length) : 0
    const pushCnt = bpmHistory.length
    const BPM_INTERVAL = 10;

    useEffect(() => {
        if (pushCnt === limitPushCnt) {
            trackAreaRef.current.scrollIntoView({
                behavior: 'smooth'
            })
            const maxBpm = bpm + BPM_INTERVAL;
            const minBpm = bpm - BPM_INTERVAL;
            var pickUptracks = tracks.filter(value => value.features.tempo > minBpm && value.features.tempo < maxBpm)
            if (shuffleRef.current.checked) {
                pickUptracks = pickUptracks.sort(() => Math.random() - 0.5);
            }
            setBpmTrack(pickUptracks);
            setResultBpm(Math.round(bpm));
            setBpmHistory([]);
            if (autoPlayRef.current.checked) {
                play(pickUptracks[0]);
            }
        }
    }, [bpmHistory]);

    const play = async (track) => {
        const tracks = bpmTrack.slice(bpmTrack.indexOf(track));
        const query = {
            headers: {
                Authorization: `Bearer ${token}`
            },
        }
        const isPlayingRes = await axios.get(process.env.REACT_APP_BASE_URI + 'me/player/currently-playing', query);
        if (isPlayingRes.status === 204) {
            if (navigator.userAgent.match('iPhone|iPad|Android.+Mobile')) {
                window.location = (`https://open.spotify.com/track/${track.id}`);
            } else {
                alert('pcでは事前にspotifyを起動してください');
                return
            }
        }
        let params = '';
        params = { uris: tracks.map(value => value.uri) };
        const body = JSON.stringify(params)
        axios.put(process.env.REACT_APP_BASE_URI + 'me/player/play', body, query)
    }
    return (
        <div>
            <div className={style.measurementBpmArea}>
                <div className={style.currentBpm}>
                    <h1>BPM : {bpm}</h1>
                    <CheckBpmBtn bpmArray={bpmHistory} setBpmArray={setBpmHistory} autoReset={true}></CheckBpmBtn>
                    <div className={style.optionArea}>
                        <input type="checkbox" ref={autoPlayRef} /> 自動再生
                        <input type="checkbox" ref={shuffleRef} /> シャッフルして表示
                        <div style={{ marginTop: '20px' }}>
                            <InputLabel >検索までの押下数</InputLabel>
                            <Select value={limitPushCnt} onChange={(e) => setLimitPushCnt(e.target.value)}>
                                <MenuItem value={3}>3</MenuItem>
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={7}>7</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                            </Select>
                        </div>
                    </div>
                </div>
                <ol className={style.BpmHistoryView}>
                    {bpmHistory.map((value, i) => <li key={i}><span>{value}</span></li>)}
                </ol>
            </div>
            <div className={style.viewResultTrack} ref={trackAreaRef}>
                {bpmTrack.length ?
                    <>
                        <h1>Result : BPM {resultBpm}</h1>
                        <h3>{`BPM ${resultBpm - 10}~${resultBpm + 10}の曲一覧`}</h3>
                        <div onClick={() => { play(bpmTrack[0]) }}>
                            <PlayBtn></PlayBtn>
                        </div>
                        <ContentsList destination={['tempo', 'danceability', 'acousticness', 'liveness']}
                            contents={bpmTrack}
                            actionFunc={play}
                            actionElements={[<PlayBtn />]} />
                    </>
                    : null
                }
            </div>
        </div>
    )
}