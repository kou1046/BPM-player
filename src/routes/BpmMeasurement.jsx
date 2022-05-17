import { useEffect, useRef, useState} from "react";
import { CheckBpmBtn } from "../components/CheckBpmBtn";
import { ContentsList } from "../components/ContentsList";
import style from './BpmMeasurement.module.scss';
import axios, { AxiosError } from "axios";
import { PlayBtn } from "../components/PlayBtn";
import { Button,FormControl,InputLabel,MenuItem,Select} from "@mui/material";
import {  Line } from "react-chartjs-2";
import { Chart,registerables } from "chart.js";

const BPM_INTERVAL = 5;
const WINDOW_SIZE = 50;
const ACTIVE_TIME_LIMIT = 5; //秒]
Chart.register(...registerables)

export const BpmMeasurement = ({token,artists,tracks}) => {
    const [bpmHistory,setBpmHistory] = useState([]);
    const [bpmTrack,setBpmTrack] = useState([]);
    const [limitPushCnt,setLimitPushCnt] = useState(3);
    const [resultBpm,setResultBpm] = useState(0);
    const [isAllow,setIsArrow] = useState(false);
    const [isActive,setIsActive] = useState(false);
    const [resultMyAcc,setResultMyAcc] = useState({time:[],x:[],y:[],z:[],threshold:[]});
    const myAcc = useRef({time:[],x:[],y:[],z:[],threshold:[]});
    const accActive = useRef(false);
    const isOver = useRef(false);
    const windowAcc = useRef([]);
    const startTime = useRef(0);
    const overStart = useRef(0);
    const getAccCnt = useRef(0);
    const threshold = useRef(1.5); // 動的閾値　初期値はここで設定
    const bpmBtnRef = useRef();
    const trackAreaRef = useRef(null);
    const autoPlayRef = useRef(null);
    const shuffleRef = useRef(null); 
    const bpm = bpmHistory.length ? Math.round(bpmHistory.reduce((prev,cur) => prev+cur ) / bpmHistory.length) : 0;
    const pushCnt = bpmHistory.length;

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

    const requestPermission = () => {
        DeviceOrientationEvent.requestPermission().then((res) => {
            if(res == 'granted'){
                window.addEventListener('deviceorientation',getGyro);
                window.addEventListener('devicemotion',getAcceleration);
                setIsArrow(true);
            }else{
                alert('加速度の取得サービスが拒否されました');
            }
        })
    }
    const getGyro = () => {

    }

    const getAcceleration = (e) => {
        if (accActive.current){
            if (getAccCnt.current === 0){
                startTime.current = Date.now();
            }
            const {x:newx,y:newy,z:newz} = e.acceleration;
            const newTime = (Date.now() - startTime.current) / 1000; //msからsecへ
            const target = newz; // 要調整
            windowAcc.current = [...windowAcc.current,target];
            if (windowAcc.current.length === WINDOW_SIZE){
                const maxWindowAcc = windowAcc.current.reduce((prev,cur) => Math.max(prev,cur));
                const minWindowAcc = windowAcc.current.reduce((prev,cur) => Math.min(prev,cur));
                const newThreshold = maxWindowAcc + minWindowAcc / 2
                if (newThreshold > 0.5){
                    threshold.current = newThreshold //動的閾値の更新　直近加速度データの最大値と最小値の平均
                }
                windowAcc.current = [];
            }
            if (target > threshold.current & !isOver.current){ //閾値を超えた時の処理
                overStart.current = Date.now(); //超えた時の時間を記憶
                isOver.current = true;
            }
            if (target < threshold.current && isOver.current){ //　閾値を超えて下がったらカウント
                bpmBtnRef.current.push();
                isOver.current = false;
            }
            const {time,x,y,z,threshold:th} = myAcc.current;
            myAcc.current = {time:[...time,newTime],x:[...x,newx],y:[...y,newy],z:[...z,newz],threshold:[...th,threshold.current]};
            getAccCnt.current = getAccCnt.current + 1;
            if ((Date.now() - startTime.current) / 1000 >= ACTIVE_TIME_LIMIT || pushCnt === limitPushCnt){
                setResultMyAcc(myAcc.current);
                threshold.current = 1.5
                getAccCnt.current = 0;
                isOver.current = false;
                myAcc.current = {time:[],x:[],y:[],z:[],threshold:[]};
                windowAcc.current = [];
                setIsActive(false);
                accActive.current = false;
            }
        }
    }

    const renderChart = () => {
        const data = {
            labels: resultMyAcc.time,
            datasets: [
              //{
              // label:'x',
              // data:resultMyAcc.x,
              // borderColor:'green'
              //},
              //{
              //  label:'y',
              //  data:resultMyAcc.y,
              //  borderColor:'red'
              //},
              {
                  label:'z',
                  data:resultMyAcc.z,
                  borderColor:'black'
              },
              {
                  label:'threshold',
                  data:resultMyAcc.threshold,
                  borderColor:'red'
              }
            ],
        }
        const options = {
            plugins:{
                title:{
                    display:true,
                    text:'acceleration'
                }
            },
            elements:{
                point:{
                    radius:0
                }
            },            scales:{
                x:{
                    title:{
                        display:true,
                        text:'Time [s]'
                    }
                }
            }
        }
        return (
            <div>
              <Line data={data} options={options} />
            </div>
        )
    }

    const play = async (track) => {
        const tracks = bpmTrack.slice(bpmTrack.indexOf(track));
        const query = {
            headers: {
                Authorization: `Bearer ${token}`
            },
        }

        const isPlayingRes = await axios.get(process.env.REACT_APP_BASE_URI + 'me/player/currently-playing',query);
        if (isPlayingRes.status === 204){
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
                    <CheckBpmBtn bpmArray={bpmHistory} setBpmArray={setBpmHistory} autoReset={true} ref={bpmBtnRef}></CheckBpmBtn>
                    <div>
                        {!isAllow && DeviceOrientationEvent.requestPermission ? <Button color='success' variant="contained" sx={{height:50}} onClick={requestPermission}>加速度センサーの有効化</Button> : null}
                        {isAllow ? <Button variant="contained" color={isActive ?  'error' : 'success'} sx={{height:50}} onClick={() => (accActive.current=true,setIsActive(true))}>{!isActive ? '歩行の検出' : '検出中．．．'}</Button> : null}
                    </div>
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

                    {bpmHistory.map((value,i) => <li key={i}><span>{value}</span></li>)}
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
            {resultMyAcc ? renderChart() : null}  
        </div>
    )
}