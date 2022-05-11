import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { LogoutBtn } from "../components/LogoutBtn";
import { LoginBtn } from "../components/LoginBtn";
import ArtistImg from '../images/Artist.png'
import PlayListImg from '../images/PlayList.png'
import style from './Home.module.scss'
import Button from "@mui/material/Button";

export const Home = ({token,setToken}) => {

    console.log('home render');

    const buttonStyle = {width:200,
        height:200,
        fontSize:20,
        margin:'1em',
        border: 2
        
    }

    return (
        <>
            <div className={style.selectClass}>
                <Link to='select-artists'>
                    <Button variant='outlined' sx={buttonStyle}>Artists</Button>
                </Link>
                <Link to='select-playlists'>
                    <Button variant='outlined' color='secondary' sx={buttonStyle} >Playlists</Button>
                </Link>
            </div>
        </>
    )
}