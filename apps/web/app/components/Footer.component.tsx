import React from 'react'

function FooterComponent() {
    return (
        <div className='flex justify-evenly items-center md:flex-row flex-col bg-neutral-100 text-neutral-600 text-sm'>

            <div aria-label='declaration'>
                <div aria-label='copyright' className=''>
                    © 2024 MatchChat. All rights reserved.
                </div>
            </div>

            <div aria-label='menu' className='flex justify-center space-x-4 p-4' >
                <a href='/terms' className='hover:underline'>Code of Conduct</a>
                <a href='/privacy' className='hover:underline'>Privacy Policy</a>
                <a href='/contact' className='hover:underline'>Buy me a coffee</a>
            </div>

        </div>
    )
}

export default FooterComponent
