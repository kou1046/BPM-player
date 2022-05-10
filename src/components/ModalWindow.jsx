import style from './ModalWindow.module.scss';

export const ModalWindow = ({showIs,setShowIs,children}) => {{
    if (showIs)
    return (
        <>
            <div className={style.overLay}>
                <div className={style.content}>
                    {children}
                    <button onClick={() => setShowIs(!showIs)}>Close</button>
                </div>
            </div>
        </>
    )
}}