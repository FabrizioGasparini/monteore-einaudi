import { CalendarIcon, ChevronRightIcon, UserIcon } from '@heroicons/react/solid'
import Link from 'next/link';
import useSWR from 'swr'
import { fetcher } from '../fetcher'
import { Activity, closingDate, formatDate, formatTime } from './activities';

const dateOptions = { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };

export default function MyActivities() {
    const { data: activities, isValidating, error} = useSWR('/api/subscriptions', fetcher);
    
    if(isValidating) return <span>Carico dati...</span>
    if(error) return <span>Si è verificato un errore: {error}</span>
 
    const unsubscribeToEvent = (id: number) => {
        fetch("/api/unsubscribe", {
            credentials: 'include',
            method: "POST",
            body: JSON.stringify({ id: id }),
            cache: "no-cache",
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json"
            })
        })
            .then((res) => { return res.json() })
            .then((data) => {
                if (data.status !== 200) {
                    alert(data.message)
                }
                window.location.reload()
                return data
            })
            .catch((e) => {
                console.log(e)
                alert("Si è verificato un errore. Riprova")
            })
    }

    return (
        <>
            <div className='min-h-screen h-full flex flex-col px-4 py-4 w-full'>
                <div className="shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="flex flex-wrap gap-4 items-center justify-center w-full">
                        {activities.length === 0 && <p>Nessuna iscrizione trovata</p>}
                        {activities.map((activity: Activity) => {
                            const startTime = new Date(activity.startTime);
                            const endTime = new Date(activity.endTime);
                            return (
                                <li className='bg-[#282828] border-solid border-gray-700 border-2 rounded-xl p-4 w-[100%] lg:w-[30%]' key={activity.id}>
                                    <h3 title={activity.name} className='my-2 text-xl font-bold text-ellipsis overflow-hidden whitespace-nowrap'>{activity.name}</h3>
                                    <div className="text-sm text-gray-400 mx-1">📍 {activity.location.toUpperCase()}</div>
                                    <div className="text-sm text-gray-400 mx-1">📆 {formatDate(startTime).toUpperCase()}</div>
                                    <div className="text-sm text-gray-400 mx-1">⏰ {formatTime(startTime)}-{formatTime(endTime)}</div>
                                    <div className="text-sm text-gray-400 mx-1">👥 {activity._count?.subscriptions}/{activity.maxNumber} ISCRITTI</div>
                                    {
                                       <button onClick={() => unsubscribeToEvent(activity.id)} type="button" className='mt-4 p-3 w-full cursor-pointer text-base font-medium rounded-xl bg-[#ff0000] transition-all ease-in-out hover:scale-[1.02]'>Annulla Iscrizione</button>
                                    }
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </>
    )
}