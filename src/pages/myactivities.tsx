import { CalendarIcon, ChevronRightIcon, UserIcon } from '@heroicons/react/solid'
import Link from 'next/link';
import useSWR from 'swr'
import { fetcher } from '../fetcher'
import { Activity, Subscription, closingDate, formatDate, formatTime } from './activities';

const dateOptions = { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric' };

export default function MyActivities() {
    const { data: activities, isValidating, error} = useSWR('/api/subscriptions', fetcher);
    
    if(isValidating) return <span>Carico dati...</span>
    if(error) return <span>Si è verificato un errore: {error}</span>
 
    const unsubscribeToEvent = (id: number, position: number) => {
        fetch("/api/unsubscribe", {
            credentials: 'include',
            method: "POST",
            body: JSON.stringify({ id: id, position }),
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
                alert("Si è verificato un errore. Riprova")
            })
    }

    const getSubsByPositions = (id: number, pos: number) => {
        let count = 0
        for (let index = 0; index < activities.length; index++) {
            const activity = activities[index];

            if (activity.activity.id == id && activity.position == pos) count++
        }

        return count
    }

    return (
        <>
            <div className='min-h-screen h-full flex flex-col px-4 py-4 w-full'>
                <div className="shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="flex flex-wrap gap-4 items-center justify-center w-full">
                        {activities.length === 0 && <p>Nessuna iscrizione trovata</p>}
                        {activities.map((sub: Subscription) => {
                            const startDate = new Date(sub.activity.startTime);
                            const startTime = new Date(0, 0, 0, 8 + (sub.position * sub.activity.duration))
                            const endTime = new Date(0, 0, 0, 8 + ((sub.position + 1) * sub.activity.duration))
                            return (
                                <li className='bg-[#282828] border-solid border-gray-700 border-2 rounded-xl p-4 w-[100%] lg:w-[30%]' key={sub.activity.id}>
                                    <h3 title={sub.activity.name} className='my-2 text-xl font-bold text-ellipsis overflow-hidden whitespace-nowrap'>{sub.activity.name}</h3>
                                    <div className="text-sm text-gray-400 mx-1">📍 {sub.activity.location.toUpperCase()}</div>
                                    <div className="text-sm text-gray-400 mx-1">📆 {formatDate(startDate).toUpperCase()}</div>
                                    <div className="text-sm text-gray-400 mx-1">⏰ {formatTime(startTime)}-{formatTime(endTime)}</div>
                                    <div className="text-sm text-gray-400 mx-1">👥 {getSubsByPositions(sub.activity.id, sub.position)}/{sub.activity.maxNumber} ISCRITTI</div>
                                    {
                                       <button onClick={() => unsubscribeToEvent(sub.activity.id, sub.position)} type="button" className='mt-4 p-3 w-full cursor-pointer text-base font-medium rounded-xl bg-[#ff0000] transition-all ease-in-out hover:scale-[1.02]'>Annulla Iscrizione</button>
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