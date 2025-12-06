"use client"
import React from 'react'
import { initializeConnection } from '../socketio';

function StartChatComponent() {
    const handleStartChat = () => {
        console.log("Start chat button clicked");

        const socket = initializeConnection();
        socket.on("connect", () => {
            socket.emit("join");
            console.log("Connected to the server with ID:", socket.id);
        });
    };

    return (
        <button type='button' className="text-white bg-blue-600 box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none" onClick={handleStartChat}>Start chat</button>
    )
}

export default StartChatComponent
