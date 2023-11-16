import React from 'react';
import useAuth from '../hook/useAuth';

const Header = () => {
    const auth = useAuth();
    return (
        <section className='h-[clamp(5rem,6vh,7rem)] sticky top-0 z-[2] bg-[var(--nav-bg-color)] flex'>
            {/* Phone, Tablet */}
            <div className=' flex justify-between items-center laptop:hidden'>
                <a href='#' className='fa fa-arrow-left'>&ensp;Chat</a>
                <div className='text-center'>
                    <p className='font-bold'>{auth.user}</p>
                    <p className='text-blue-500'>status</p>
                </div>
                <div className='flex gap-[3rem]'>
                    <div className='flex gap-[.3rem] items-center'>
                        <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
                        <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
                        <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-400'></div>
                    </div>
                    <a href='#' className='w-[3rem] aspect-square rounded-[50%] border-[.2rem] border-gray-400'></a>
                </div>
            </div>
            {/* Laptop, Desktop */}
            <div className=' flex justify-between items-center grow'>
                <a href='#' className='font-bold'>Messenger</a>
                <div className='flex items-center gap-[5rem]'>
                    <div className='flex items-center gap-[1rem]'>
                        <a href='#' className='w-[3rem] aspect-square rounded-[50%] bg-orange-400'></a>
                        <div className='text-left'>
                            <p className=''>{auth.user}</p>
                            <p className='text-blue-500'>status</p>
                        </div>
                    </div>
                    <a href='#' className='w-[3rem] aspect-square rounded-[1rem] bg-gray-300 text-gray-500 fa fa-arrow-down font-normal flex justify-center items-center'></a>
                </div>
            </div>
        </section>
    )
}

export default Header