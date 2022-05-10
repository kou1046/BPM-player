import axios from "axios";
import { useState , useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import style from './SearchArtist.module.scss'
import { ContentsList } from '../components/ContentsList';
import { PlusBtn } from "../components/PlusBtn";
import { ModalWindow } from "../components/ModalWindow";
import Button from "@mui/material/Button";
import Box from '@mui/material';

export const SearchArtist = ({token,artistState,trackState,setTrackFunc}) => {
    const [searchResult,setSearchResult] = useState([]);
    const [selectArtists,setSelectArtists] = artistState;
    const [modalIs,setModalIs] = useState(false);
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
        <div className={style.selectedViewArea}>
            <h1 style={{textAlign:'center'}}>選択中のアーティスト</h1>
            <div className={style.selectArea}>
                {selectArtists.length ?
                selectArtists.map((value,index) => (
                    <div key={`select-${index}`} className={style.selectContent}>
                        {modalIs ? <ModalWindow width='640' height='640' showIs={modalIs} setShowIs={setModalIs}>
                                        <img src={value.images[0].url} alt={value.name} />
                                        <h2>{value.name}</h2>
                                    </ModalWindow> : null}
                        <img onClick={() => setModalIs(!modalIs)} width='100' height='100' src={value.images[2].url}></img>
                        <p title={value.name}>{value.name}</p>
                        <Button color="error" variant='contained' onClick={() => setSelectArtists(selectArtists.filter(el => el != value))}>×</Button>
                    </div>
                )) : 
                null
                }
            </div>
        </div>
        
        <div className={style.searchArea}>
            <div className={style.inputKey}>
                <input ref={searchKey} placeholder='Search by Artist Name' type="text" />
                <Button onClick={getResult} variant='contained'>検索</Button>
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
                <Button variant='contained' sx={{borderRadius:3}} onClick={execution}>次へ</Button>
            </Link>
        </div>
    </>
    )
}