import style from './LoginBtn.module.scss';

export const LoginBtn = () => {
    const login = () => {
        window.location.href = process.env.REACT_APP_URI
    }

    return (
        <>
            <button className={style.login} onClick={login}>Login</button>
        </>
    )
}