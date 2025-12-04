import React from 'react'

function HeaderComponent() {
    return (
        <div className='flex justify-between border-b-2 border-gray-300 p-4 items-center'>
            <div aria-label='logo'>
                <h1>MatchChat</h1>
            </div>
            <div aria-label='count'>
                <div className='flex'>
                    <p><span className='p-2 text-3xl'>100K+</span>Online users</p>
                </div>
            </div>
        </div>
    )
}

export default HeaderComponent
