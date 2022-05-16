import {useEffect, useState , useCallback , forwardRef, useImperativeHandle} from "react"
import classes from './CheckBpmBtn.module.scss';
import { Button } from "@mui/material";
import { style } from "@mui/system";

export const CheckBpmBtn = forwardRef(({bpmArray,setBpmArray,disabled,autoReset=false},ref) => {
    const [startTime,setStart] = useState(0)
    const [pushCnt,setPushCnt] = useState(0)

    useImperativeHandle(ref,() => ({
        push : measureBpm
    }));
    
    const resetBpm = useCallback(() => {
        setBpmArray([])
        setPushCnt(0) 
    },[])

    const measureBpm = () => {
        if (!pushCnt){
            setStart(Date.now())
            setPushCnt((prev) => prev+1)
            return 
           }
       const endTime = Date.now();
       const intervalSec = (endTime - startTime) / 1000;
       const answer = Math.round((1 / intervalSec) * 60)
       if (pushCnt > 1 && autoReset){
            if (answer*1.5 < bpmArray[bpmArray.length - 1] || answer/1.5 > bpmArray[bpmArray.length - 1]){
                resetBpm();
                return
            }
       }
       setStart(endTime)
       setBpmArray([...bpmArray,answer])
       setPushCnt((prev) => prev+1)
    }

    
    return (
        <>
            <p><Button className={classes.button} variant="contained" sx={{
                marginX:10,
                borderRadius:50,
                height:200,
                width:200,
                fontSize:20,
                marginBottom:2,
                border:"solid black 3px"
            }} onClick={measureBpm} disabled={disabled}>PUSH!</Button></p>
            <p><Button className={classes.button} variant="contained" color='error' onClick={resetBpm} >RESET</Button></p>
        </>
    )
})