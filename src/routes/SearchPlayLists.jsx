import { useState,useEffect } from "react";
import axios from "axios";

export const SearchPlayLists = ({token}) => {
    const [myPlayLists,setMyPlayLists] = useState([]);
    const loadPlayListsAndSet = async () => {
        console.log(token);
        const query = {
            headers:{
                Authorization : `Bearer ${token}`
            },
            params:{
                limit : 50
            }
        }
        const {data} = await axios.get(process.env.REACT_APP_BASE_URI + 'me/playlists',query);
        setMyPlayLists(data.items);
    }

    useEffect(() => {
        (async () => {
            await loadPlayListsAndSet();
        })();
    },[])
    return (
        <>
            {myPlayLists.length ? myPlayLists[0].id : null}
        </>
    )
}

    
