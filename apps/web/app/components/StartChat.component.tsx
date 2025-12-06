"use client"

import React from 'react'
import { initializeConnection } from '../socketio';
import { useRouter } from 'next/navigation';


function StartChatComponent() {
    const router = useRouter();
    const handleStartChat = () => {
        console.log("Start chat button clicked");

        const socket = initializeConnection();
        socket.on("connect", () => {
            if (socket.connected) {
                socket.emit("join");
                router.push('/lobby');
            }
        });
    };

    return (
        <button type='button' className="text-white bg-blue-600 box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none" onClick={handleStartChat}>Start chat</button>
    )
}

export default StartChatComponent
