import { useState, useEffect } from 'react';
import { BpmMeasurement } from './routes/BpmMeasurement';
import { SearchArtist } from './routes/SearchArtist';
import { BrowserRouter, Link, Route ,Routes} from 'react-router-dom';
import { Home } from './routes/Home';
import axios from 'axios';
import { LoginBtn } from './components/LoginBtn';
import { LogoutBtn } from './components/LogoutBtn';

export const App = () => {
    const [token,setToken] = useState('');
    const [selectArtists,setSelectArtists] = useState([]);
    const [tracks,setTracks] = useState([]);

    console.log('app render');
    
    useEffect(() => {
        const hash = window.location.hash;
        let token = window.localStorage.getItem('token');
        if (!token && hash){
            token = window.location.hash.substring(1).split('&').find((value) => value.startsWith('access_token')).split('=')[1] 
            window.location.hash = '';
            window.localStorage.setItem('token',token);
        }

        if (token && localStorage.getItem('myartists')){
            const myArtists = JSON.parse(localStorage.getItem('myartists'))
            setSelectArtists(myArtists); //曲の情報は大きすぎるのでローカルストレージには保存せず、更新毎にapiで取得する
            setTracksFromArtists(token,myArtists);
        }
        setToken(token)
    },[]) 

    const splitArray = (array,splitNum) => {
        let newArray = [];
        const length = array.length;
        let n = 0;
        for(let i=0; i<length; i++){
            newArray = [...newArray,array.slice(n,n+splitNum)];
            n += splitNum;
            if (n >= length) break;
        }
        return newArray
    }

    const setTracksFromArtists = async (token,artists) => {
        let albums = await Promise.all(artists.map(async value => {
            const id = value.id
            const {data} = await axios.get(process.env.REACT_APP_BASE_URI + `artists/${id}/albums`,{
                headers:{
                    Authorization : `Bearer ${token}`
                },
                params:{
                    include_groups:'album'
                }
            })
            return data.items
        }))
        
        albums = albums.reduce((prev,curr) => [...prev,...curr]); //アーティストごとに2次元配列になっているので1次元配列にしておく

        let tracks = await Promise.all(albums.map(async value => {
            const id = value.id;
            const {data} = await axios.get(process.env.REACT_APP_BASE_URI + `albums/${id}/tracks`,{
                headers:{
                    Authorization : `Bearer ${token}`
                }
            })
            data.items.map(track => { //一応ここでアルバムのアートワークurlを各曲にプロパティとして記憶させておく
                track.images = value.images
            })
            return data.items
        }));

        tracks = tracks.reduce((prev,curr) => [...prev,...curr]); //アルバムごとに2次元配列になっているので1次元配列にしておく

        let splitTracks = [];
        //↓100曲までしか同時に特徴量がとれないので一旦100曲ごとに配列を分ける
        if (tracks.length > 100) {
            splitTracks = splitArray(tracks,100);
        }else{
            splitTracks = [tracks];
        }

        Promise.all(splitTracks.map(async (values,i) => {
            const {data} = await axios.get(process.env.REACT_APP_BASE_URI +  'audio-features',{
                headers:{
                    Authorization : `Bearer ${token}`
                },
                params:{
                    ids:values.map(value => value.id).join(',')
                }
        })
        data.audio_features.map((value,j) => {
            splitTracks[i][j].features = value //featuresオブジェクトをプロパティとしてを各曲に追加
        })

    }
    ))
    setTracks(splitTracks.reduce((prev,cur) => [...prev,...cur]));
    }
   
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Home token={token} setToken={setToken}></Home>} />
                <Route path='/select' element={<SearchArtist token={token} artistState={[selectArtists,setSelectArtists]} trackState={[tracks,setTracks]} setTrackFunc={setTracksFromArtists}></SearchArtist>} />
                <Route path='/player' element={<BpmMeasurement token={token} artists={selectArtists} tracks={tracks}></BpmMeasurement>} />
            </Routes>
            <footer>
                {!token ? <LoginBtn></LoginBtn> : <Link to='/'><LogoutBtn setToken={setToken}></LogoutBtn></Link>}
            </footer>
        </BrowserRouter>
    );
};