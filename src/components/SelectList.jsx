import style from "./SelectList.module.scss";
import { Button } from "@mui/material";

export const SelectList = ({ contentList, setContentList, label}) => {
    return (
        <div className={style.selectedViewArea}>
            <h1 style={{ textAlign: 'center' }}>{label}</h1>
            <div className={style.selectArea}>
                {contentList.map((value, index) => (
                    <div key={`select-${index}`} className={style.selectContent}>
                        <img width='100' height='100' src={value.images.length ?  value.images[0].url : ''} alt={value.name}></img>
                        <p title={value.name}>{value.name}</p>
                        <Button color="error" variant='contained' onClick={() => setContentList(contentList.filter(el => el != value))}>×</Button>
                    </div>
                ))}
            </div>
        </div>
    )
}