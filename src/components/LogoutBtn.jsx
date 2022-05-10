import style from './LogoutBtn.module.scss';

export const LogoutBtn = ({setToken}) => {
    const logout = () =>{
        setToken('');
        window.localStorage.removeItem('token');
    }
    return (
        <>
            <button className={style.logOut} onClick={logout}>Logout</button>
        </>
    )
}