import React, {useEffect, useRef} from "react";

export function useInterval(callback, delay) {

    const callBackRef = useRef();

    useEffect( () => {
        callBackRef.current = callback;
    }, [callback]);

    useEffect( () => {
        const interval = setInterval(() => callBackRef.current(), delay);
        return () => clearInterval(interval);
    }, [delay]);

}

export default useInterval;
