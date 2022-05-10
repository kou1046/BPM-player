import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { LogoutBtn } from "../components/LogoutBtn";
import { LoginBtn } from "../components/LoginBtn";
import ArtistImg from '../images/Artist.png'
import PlayListImg from '../images/PlayList.png'
import style from './Home.module.scss'

export const Home = ({token,setToken}) => {

    console.log('home render');

    return (
        <>
            <div className={style.selectClass}>
                <Link to='select'>
                    <div className={style.classType} >
                        <img width='300' height='280' src={ArtistImg} alt="Artists" />
                        <p>Artists</p>
                    </div>
                </Link>
                <div className={style.classType}>
                    <img width='300' height='280' src={PlayListImg} alt="Playlists" />
                    <p>Playlists</p>
                </div>
            </div>
        </>
    )
}