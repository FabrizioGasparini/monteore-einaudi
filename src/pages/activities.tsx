import useSWR from 'swr'
import { fetcher } from '../fetcher'
import { useState } from 'react';

export type Subscription = {
    id: number;
    email: string;
    name: string;
    activity: Activity;
    activityId: number;
}

export type Activity = {
    id: number;
    name: string;
    description: string;
    startTime: Date;
    endTime: Date;
    maxNumber: number;
    location: String;
    subscriptions?: Array<Subscription>;
    _count?: {
        subscriptions: number;
    }
}

export const closingDate = new Date("2025-05-30T12:30:00Z")

const dateOptions = { timeZone: 'UTC', month: 'long', weekday:'long', day: 'numeric', year: 'numeric'};

export const formatDate = (date: Date) => {
    return date.toLocaleString([], dateOptions as any)
}

export const formatTime = (date: Date) => {
    return `${date.getHours() > 9 ? date.getHours() : "0" + date.getHours().toString()}:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes().toString()}`
}

export default function Activities({ email }: { email: string }) {
    const { data: activities, isValidating, error} = useSWR('/api/activities', fetcher);
    const [giorno, setGiorno] = useState(0)
    const [ora, setOra] = useState(0)
    const [stato, setStato] = useState("tutte")
    const [nome, setNome] = useState("")

    if(isValidating) return <span>Carico dati...</span>
    if(error) return <span>Si è verificato un errore: {error}</span>

    const subscribeToEvent = (id: number) => {
        fetch("/api/subscribe", {
            credentials: 'include',
            method: "POST",
            body: JSON.stringify({ id: id}),
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

    const today = new Date()
    return (
        <>
            <div className='min-h-screen h-full flex flex-col px-4 py-4 w-full'>
                <div className="shadow overflow-hidden sm:rounded-md">
                    <div className="flex flex-wrap gap-4 justify-center items-center p-4 mx-4">
                        <label htmlFor='nome' className='flex items-center gap-2'>Cerca per nome: </label>
                        <input type="text" id="nome" placeholder="Es. Laboratorio Arduino" onChange={(e) => setNome(e.target.value)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]'/>

                        <label htmlFor='giorno' className='flex items-center gap-2'>Giorno:</label>
                        <select id="giorno" onChange={(e) => setGiorno(Number(e.target.value))} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]'>
                            <option value="0">Tutti</option>
                            <option value="1">Lunedì</option>
                            <option value="2">Martedì</option>
                            <option value="3">Mercoledì</option>
                            <option value="4">Giovedì</option>
                            <option value="5">Venerdì</option>
                            <option value="6">Sabato</option>
                        </select>

                        <label htmlFor='ora' className='flex items-center gap-2'>Ora:</label>
                        <select id="ora" onChange={(e) => setOra(Number(e.target.value))} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]'>
                            <option value="0">Tutte</option>
                            <option value="8">08:00</option>
                            <option value="9">09:00</option>
                            <option value="10">10:00</option>
                            <option value="11">11:00</option>
                            <option value="12">12:00</option>
                            <option value="13">13:00</option>
                            <option value="14">14:00</option>
                            <option value="15">15:00</option>
                        </select>

                        <label htmlFor='stato' className='flex items-center gap-2'>Stato Iscrizioni:</label>
                        <select id="stato" onChange={(e) => setStato(e.target.value)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]'>
                            <option value="tutte">Tutte</option>
                            <option value="aperte">Aperte</option>
                            <option value="piene">Piene</option>
                            <option value="scadute">Scadute</option>
                        </select>
                    </div>
                    <ul role="list" className="flex flex-wrap gap-4 items-center justify-center w-full" >
                        {activities
                            .filter((activity: Activity) => {
                                const startDate = new Date(activity.startTime)
                                const endDate = new Date(activity.endTime)
                                
                                const nomeMatch = nome == "" || activity.name.toLowerCase().includes(nome.toLowerCase()) || activity.location.toLowerCase().includes(nome.toLowerCase()) 
                                const giornoMatch = giorno == 0 || startDate.getDay() == giorno
                                const oraMatch = ora == 0 || startDate.getHours() == ora || (startDate.getHours() >= ora && endDate.getHours() <= ora)
                                const chiuseMatch = stato == "tutte" || (stato == "aperte" && activity._count?.subscriptions! < activity.maxNumber && today < closingDate && today < startDate) || (stato == "piene" && activity._count?.subscriptions! >= activity.maxNumber) || (stato == "scadute" && (today >= closingDate || today >= startDate) )  //!nascondiChiuse || today < closingDate && today < startDate && activity._count?.subscriptions! < activity.maxNumber
                                const alreadySubscribed = activity.subscriptions?.some((subscription: any) => subscription.email == email)

                                return nomeMatch && giornoMatch && oraMatch && chiuseMatch && !alreadySubscribed;
                            })
                            .map((activity: Activity) => {
                                const startTime = new Date(activity.startTime);
                                const endTime = new Date(activity.endTime);
                                return (
                                    <li className='bg-[#282828] border-solid border-gray-700 border-2 rounded-xl p-4 w-[30%]' key={activity.id}>
                                        <h3 title={activity.name} className='my-2 text-xl font-bold text-ellipsis overflow-hidden whitespace-nowrap'>{activity.name}</h3>
                                        <div className="text-sm text-gray-400 mx-1">📍 {activity.location.toUpperCase()}</div>
                                        <div className="text-sm text-gray-400 mx-1">📆 {formatDate(startTime).toUpperCase()}</div>
                                        <div className="text-sm text-gray-400 mx-1">⏰ {formatTime(startTime)}-{formatTime(endTime)}</div>
                                        <div className="text-sm text-gray-400 mx-1">👥 {activity._count?.subscriptions}/{activity.maxNumber} ISCRITTI</div>
                                        {
                                            
                                            today > closingDate || today > startTime
                                                ? <button type="button" disabled className='mt-4 p-3 w-full cursor-not-allowed text-base font-medium rounded-xl bg-[#ff0000]'>Tempo per l&apos;iscrizione terminato! Iscrizioni chiuse</button>
                                                : activity._count!.subscriptions >= activity.maxNumber
                                                    ? <button type="button" disabled className='mt-4 p-3 w-full cursor-not-allowed text-base font-medium rounded-xl bg-[#ff0000]'>Attività Piena! Iscrizioni chiuse</button>
                                                    : <button onClick={() => subscribeToEvent(activity.id)} type="button" className='mt-4 p-3 w-full cursor-pointer text-base font-medium rounded-xl bg-[#4c3fff] transition-all ease-in-out hover:scale-[1.02]'>Iscriviti</button>
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