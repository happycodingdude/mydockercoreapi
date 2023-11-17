import axios from 'axios';
import React, { useEffect, useState } from 'react';
import useAuth from '../hook/useAuth';

const Information = ({ conversation }) => {
    console.log('Information calling');
    const auth = useAuth();

    const [participants, setParticipants] = useState();
    const [isNotifying, setIsNotifying] = useState(false);

    useEffect(() => {
        console.log('conversation changed');
        const cancelToken = axios.CancelToken.source();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.token
        };
        axios.get(`api/conversations/${conversation?.Id}/participants`,
            { cancelToken: cancelToken.token, headers: headers })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data.data);
                    setParticipants(res.data.data);
                    setIsNotifying(res.data.data.find(item => item.ContactId === auth.id)?.IsNotifying);
                }
                else throw new Error(res.status);
            })
            .catch(err => {
                console.log(err);
            });

        return () => {
            cancelToken.cancel();
        }
    }, [conversation]);

    const toggleNotification = (e) => {
        const checked = e.target.checked;
        const cancelToken = axios.CancelToken.source();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + auth.token
        };
        const selected = participants.find(item => item.ContactId === auth.id);
        selected.IsNotifying = e.target.checked;
        axios.put(`api/participants`,
            selected,
            { cancelToken: cancelToken.token, headers: headers })
            .then(res => {
                if (res.status === 200) {
                    console.log(res.data.data);

                    setIsNotifying(checked);
                }
                else throw new Error(res.status);
            })
            .catch(err => {
                console.log(err);
            });

        return () => {
            cancelToken.cancel();
        }
    }

    return (
        <>
            <div className='bg-white shrink-0 w-[clamp(30rem,20vw,40rem)] rounded-[1rem] m-[1rem] [&>*]:px-[1rem] [&>*]:pb-[1rem] [&>*]:border-b-gray-400 [&>*:not(:first-child)]:mt-[2rem]' >
                <div className='flex justify-between pt-[1rem] border-b-[.1rem]'>
                    <p className='font-bold'>Contact Information</p>
                    <div className='flex gap-[.3rem] items-center'>
                        <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-500'></div>
                        <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-500'></div>
                        <div className='w-[.5rem] aspect-square rounded-[50%] bg-gray-500'></div>
                    </div>
                </div>
                <div className='flex flex-col gap-[1rem] border-b-[.1rem]'>
                    <div className='flex flex-col items-center'>
                        <div className='w-[5rem] aspect-square rounded-[50%] bg-orange-400'></div>
                        <p className='font-bold'>{conversation?.Title}</p>
                        <p className=' text-gray-400'>{participants?.length} members</p>
                    </div>
                    <div className='flex justify-evenly w-full'>
                        <a href='#' className='w-[10rem] aspect-[4/1.5] rounded-[1rem] border-[.1rem] border-gray-400 flex justify-center items-center fa fa-phone font-normal text-blue-500'></a>
                        <a href='#' className='w-[10rem] aspect-[4/1.5] rounded-[1rem] border-[.1rem] border-gray-400 flex justify-center items-center fa fa-video font-normal text-blue-500'></a>
                    </div>
                </div>
                <div className=' border-b-[.1rem]'>
                    <label className='text-[#757dba] uppercase'>username</label>
                    <p className='text-blue-500'>@user_name</p>
                </div>
                <div className=' border-b-[.1rem]'>
                    <div className='flex justify-between'>
                        <label>Files</label>
                        <a href='#' className='text-blue-500'>See all</a>
                    </div>
                </div>
                <div className='flex justify-between  border-b-[.1rem]'>
                    <label className='fa fa-bell font-normal'>&ensp;Notification</label>
                    <div className='relative'>
                        <input type='checkbox' id='checkbox'
                            className='absolute opacity-0 peer'
                            checked={isNotifying}
                            onChange={toggleNotification}></input>
                        <label for='checkbox' className='
                        block                
                        w-[clamp(3rem,3vw,4.5rem)] h-[100%]
                        bg-gray-400
                        rounded-[5rem]
                        relative
                        cursor-pointer
                        duration-[.3s]
                        peer-checked:bg-blue-500
                        before:h-full
                        before:aspect-square
                        before:bg-white
                        before:rounded-[50%]
                        before:border-[.2rem]
                        before:border-gray-400
                        before:absolute
                        before:z-[2]
                        before:duration-[.3s]
                        before:peer-checked:translate-x-[90%]
                        before:peer-checked:border-blue-500
                        laptop:before:peer-checked:translate-x-[130%]'>
                        </label>
                    </div>
                </div>
                <div>
                    <a href='#' className='fa fa-trash font-normal text-red-500'>&ensp;Delete chat</a>
                </div>
            </div>
        </>
    )
}

export default Information