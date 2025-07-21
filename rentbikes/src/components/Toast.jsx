import React, { useEffect, useState } from 'react';
import { Transition } from '@headlessui/react';

const Toast = ({ message, type, onDismiss }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                onDismiss();
            }, 2000); 
            return () => clearTimeout(timer);
        }
    }, [message, onDismiss]);

    let bgColor = 'bg-gray-700'; 
    if (type === 'success') {
        bgColor = 'bg-green-500';
    } else if (type === 'error') {
        bgColor = 'bg-red-500';
    } else if (type === 'info') {
        bgColor = 'bg-blue-500';
    }

    return (
        <Transition
            show={isVisible && !!message}
            as="div"
            enter="transition ease-out duration-300 transform"
            enterFrom="opacity-0 translate-y-full"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-200 transform"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-full"
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full"
        >
            <div className={`text-white text-center font-semibold py-3 px-6 rounded-lg shadow-lg ${bgColor}`}>
                {message}
            </div>
        </Transition>
    );
};

export default Toast;