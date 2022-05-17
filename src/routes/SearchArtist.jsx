import axios from "axios";
import { useState , useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import style from './SearchArtist.module.scss'
import { ContentsList } from '../components/ContentsList';
import { PlusBtn } from "../components/PlusBtn";
import { ModalWindow } from "../components/ModalWindow";
import Button from "@mui/material/Button";
import Box from '@mui/material';
import { SelectList } from "../components/SelectList";

export const SearchArtist = ({token,artistState,trackState,setTrackFunc}) => {
    const [searchResult,setSearchResult] = useState([]);
    const [selectArtists,setSelectArtists] = artistState;
    const searchKey = useRef(null);
    const bpmKey = useRef(null);

    console.log('searcharea render');

    const getResult = async () => {
        if (!searchKey.current.value) return
        const {data} = await axios.get(process.env.REACT_APP_BASE_URI + 'search',{
            headers:{
                Authorization : `Bearer ${token}`
            },
            params:{
                q:searchKey.current.value,
                type:'artist'
            }
        })
        setSearchResult(data.artists.items.filter(value => value.images.length));
    }

    const execution = async () => {
        localStorage.setItem('myartists',JSON.stringify(selectArtists));
        if(!selectArtists.length){
            alert('アーティストを選択してください！');
            return
        }
    setTrackFunc(token,selectArtists);
    }


    return (
    <>
        {selectArtists.length ? <SelectList contentList={selectArtists} setContentList={setSelectArtists} label='Selected Artists'></SelectList> : null}
        <div className={style.searchArea}>
            <div className={style.inputKey}>
                <input ref={searchKey} placeholder='Search by Artist Name' type="text" />
                <Button onClick={getResult} variant='contained'>Search</Button>
            </div>
            <h1 style={{textAlign:'center'}}>Result</h1>
            <ol className={style.searchResult}>
                {searchResult.length ?
                <ContentsList contents={searchResult} 
                              destination={['popularity']}
                              actionFunc={(arg) => setSelectArtists([...selectArtists,arg])} 
                              actionElements={[<PlusBtn />]} />
                :
                null
                }
            </ol>
        </div>
        <div className={style.registerArea}>
            <Link to={selectArtists.length ? '/player' : ''}>
                <Button variant='contained' sx={{borderRadius:3}} onClick={execution}>Next</Button>
            </Link>
        </div>
    </>
    )
}