import { useEffect, useState } from "react";
import toast from 'react-hot-toast';

export const useNetwork = () => {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setOnline(true);
            toast.success('Back online!');
        };

        const handleOffline = () => {
            setOnline(false);
            toast.error('You are offline', { duration: 5000 });
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return online;
};
