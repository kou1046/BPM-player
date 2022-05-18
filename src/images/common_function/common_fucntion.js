export const correlation = (array1, array2) => {
    const x_bar = array1.reduce((prev, cur) => prev + cur) / array1.length;
    const y_bar = array2.reduce((prev, cur) => prev + cur) / array2.length;
    const x_dev = array1.map(el => el - x_bar);
    const y_dev = array2.map(el => el - y_bar);
    const x_std = Math.sqrt(x_dev.map(el => el ** 2).reduce((prev, cur) => prev + cur));
    const y_std = Math.sqrt(y_dev.map(el => el ** 2).reduce((prev, cur) => prev + cur));
    const cov = array1.map((el, i) => x_dev[i] * y_dev[i]).reduce((prev, cur) => prev + cur);
    return cov / (x_std * y_std)
}

export const autoCorrelation = (array) => {
    const result = array.map((el, i) => correlation(array.slice(i, array.length), array.slice(0, array.length - i)))
    return result.slice(0, result.length)
}

export const movingAverage = (array, interval) => {
    const AveData = array.map((el, i) => {
        if (i >= array.length - interval) {
            return null
        }
        const intervalData = array.slice(i, i + interval + 1);
        return intervalData.reduce((prev, cur) => prev + cur) / interval
    })
    return AveData
}

export const getPeak = (array) => {
    let start = 0;
    let splitArray = [];
    for (let i=1; i<array.length; i++){
        const delta = array[i] * array[i-1];
        if (delta < 0){
            splitArray = [...splitArray,array.slice(start,i)];
            start = i;
        }
    }
    return splitArray.map(values => {
        return values[0] > 0 ? values.reduce((prev,cur) => Math.max(prev,cur)) : values.reduce((prev,cur) => Math.min(prev,cur))
    })
}
