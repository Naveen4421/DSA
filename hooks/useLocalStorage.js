"use client";
import { useState, useEffect } from "react";

export default function useLocalStorage(key, initialValue) {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const item = typeof window !== "undefined" ? window.localStorage.getItem(key) : null;
            if (item) {
                const parsed = JSON.parse(item);
                if (parsed !== undefined) {
                    setStoredValue(parsed);
                }
            }
        } catch (error) {
            console.error("Error reading localStorage key “" + key + "”:", error);
        }
        setIsLoaded(true);
    }, [key]);

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.log(error);
        }
    };

    return [storedValue, setValue, isLoaded];
}
