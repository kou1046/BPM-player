import style from './ContentsList.module.scss';

export const ContentsList = ({contents,destination,actionFunc,actionElements}) => {
    return (
        <ol className={style.viewContents}>
            {
            contents.map((value,index) => (
                <li className={style.contentArea} key={'content-' + String(index)}>
                    <img width='100' height='100' src={value.images.length ? value.images[0].url : ''}></img>
                    <div className={style.destination}>
                        <span>
                            <h2>{value.name}</h2>
                            {destination ?
                                <ol>
                                    {destination.map((prop_name,i) => <li key={`prop-${i}`}>{prop_name} : {value['features'] ? value.features[prop_name] : value[prop_name]}</li>)}
                                </ol>
                                : null
                            }
                        </span>
                    </div>
                    { actionElements ?
                        <div className={style.contentAction}>
                            {actionElements.map(element => (
                                <div onClick={() => actionFunc(value)}>
                                    {element}
                                </div>
                            ))}
                        </div> 
                        : null
                    }
                </li>
            ))
            }
        </ol>
    )
}