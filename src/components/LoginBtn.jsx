import style from './LoginBtn.module.scss';

export const LoginBtn = () => {
    const login = () => {
        window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}?client_id=${process.env.REACT_APP_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_REDIRECT_URI}&response_type=${process.env.REACT_APP_RESPONSE_TYPE}&scope=${process.env.REACT_APP_SCOPE}`
    }

    return (
        <>
            <button className={style.login} onClick={login}>Login with Spotify</button>
        </>
    )
}