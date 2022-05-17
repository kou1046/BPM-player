import { useState, useEffect } from "react";
import axios from "axios";
import { SelectList } from "../components/SelectList";
import { ContentsList } from "../components/ContentsList";
import { PlusBtn } from "../components/PlusBtn";
import { Link } from "react-router-dom";
import { Button } from "@mui/material";
import  style  from "./SearchPlayLists.module.scss";

export const SearchPlayLists = ({ token, playListsState, trackState }) => {
    const [playLists, setPlayLists] = useState([]);
    const [myPlayLists, setMyPlayLists] = playListsState;
    const [tracks, setTracks] = trackState;

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

    const loadPlayListsAndSet = async () => {
        const query = {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                limit: 50
            }
        }
        const { data } = await axios.get(process.env.REACT_APP_BASE_URI + 'me/playlists', query);
        setPlayLists(data.items);
    }

    const setTracksFromPlaylists = async () => {
        const query = {
            headers: {
                Authorization: `Bearer ${token}`
            },
        }

        let tracks = await Promise.all(myPlayLists.map(async value => {
            const { data } = await axios.get(process.env.REACT_APP_BASE_URI + 'playlists/' + `${value.id}/` + 'tracks', query);
            return data.items.map(value => {
                value.track.images = value.track.album.images;
                return value.track
            })
        }))

        tracks = tracks.reduce((prev, cur) => [...prev, ...cur]);
        let splitTracks = [];

        //↓100曲までしか同時に特徴量がとれないので一旦100曲ごとに配列を分ける
        if (tracks.length > 100) {
            splitTracks = splitArray(tracks,100);
        }else{
            splitTracks = [tracks];
        }

        Promise.all(splitTracks.map(async (values, i) => {
            const { data } = await axios.get(process.env.REACT_APP_BASE_URI + 'audio-features', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: {
                    ids: values.map(value => value.id).join(',')
                }
            })
            data.audio_features.map((value, j) => {
                splitTracks[i][j].features = value //featuresオブジェクトをプロパティとしてを各曲に追加
            })

        }
        ))

        setTracks(splitTracks.reduce((prev,cur) => [...prev,...cur]));
    }

    useEffect(() => {
        (async () => {
            await loadPlayListsAndSet();
        })();
    }, [token])

    return (
        <>
            {myPlayLists.length ? <SelectList contentList={myPlayLists} setContentList={setMyPlayLists} label='Selected Playlists'></SelectList> : null}
            
            <div className={style.myPlayLists}>
                <h1>Your Playlists</h1>
                {playLists.length ? <ContentsList contents={playLists} actionElements={[<PlusBtn></PlusBtn>]} actionFunc={(value) => setMyPlayLists([...myPlayLists, value])}></ContentsList> : null}
            </div>  
            <div className={style.registerArea}>
                <Link to='../player'><Button variant='contained' onClick={setTracksFromPlaylists}>次へ</Button></Link>
            </div>
        </>
    )
}


