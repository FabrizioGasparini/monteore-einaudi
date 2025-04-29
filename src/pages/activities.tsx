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

export const closingDate = new Date("2025-05-12T00:00:00Z")

const dateOptions = { timeZone: 'UTC', month: 'long', weekday:'long', day: 'numeric', year: 'numeric'};

export const formatDate = (date: Date) => {
    return date.toLocaleString([], dateOptions as any)
}

export const formatTime = (date: Date) => {
    return `${date.getHours() > 9 ? date.getHours() : "0" + date.getHours().toString()}:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes().toString()}`
}

export default function Activities({ email, classe }: { email: string, classe: string }) {
    const { data: activities, isValidating, error} = useSWR('/api/activities', fetcher);
    const [giorno, setGiorno] = useState(0)
    const [ora, setOra] = useState(0)
    const [stato, setStato] = useState("tutte")
    const [nome, setNome] = useState("")

    const [nomeEdit, setNomeEdit] = useState("")
    const [aulaEdit, setAulaEdit] = useState("")
    const [descEdit, setDescEdit] = useState("")
    const [dataEdit, setDataEdit] = useState("")
    const [oraInizioEdit, setOraInizioEdit] = useState("")
    const [oraFineEdit, setOraFineEdit] = useState("")
    const [maxIscrittiEdit, setMaxIscrittiEdit] = useState(0)

    const [showActivity, setShowActivity] = useState(false)
    const [activityId, setActivityId] = useState(0)

    const showDetails = (id: number) => {
        setShowActivity(true)
        setNomeEdit(activities.find((activity: Activity) => activity.id === id)?.name!)
        setAulaEdit(activities.find((activity: Activity) => activity.id === id)?.location!)
        setDescEdit(activities.find((activity: Activity) => activity.id === id)?.description!)

        const startTime = new Date(activities.find((activity: Activity) => activity.id === id)?.startTime!)
        setDataEdit(startTime.toISOString().split('T')[0])
        setOraInizioEdit(new Date(activities.find((activity: Activity) => activity.id === id)?.startTime!).toLocaleTimeString([], { 'hour': '2-digit', 'minute': '2-digit' }))
        setOraFineEdit(new Date(activities.find((activity: Activity) => activity.id === id)?.endTime!).toLocaleTimeString([], { 'hour': '2-digit', 'minute': '2-digit' }))
        setMaxIscrittiEdit(activities.find((activity: Activity) => activity.id === id)?.maxNumber!)
        setActivityId(id)
    }

    if(isValidating) return <span>Carico dati...</span>
    if(error) return <span>Si è verificato un errore: {error}</span>

    const subscribeToEvent = (id: number) => {
        fetch("/api/subscribe", {
            credentials: 'include',
            method: "POST",
            body: JSON.stringify({ id: id, class: classe}),
            cache: "no-cache",
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json"
            })
        })
        .then((res) => { return res.json() })
        .then((data) => {
            if (data.status !== 200) alert(data.message)
            else alert("Iscrizione avvenuta con successo!")
            
            setShowActivity(false)
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
                <div className="shadow overflow-hidden sm:rounded-md w-full">
                    <div className="flex flex-wrap gap-4 justify-center items-center p-4 mx-4">
                        <label htmlFor='nome' className='flex items-center gap-2'>Cerca per nome: </label>
                        <input type="text" id="nome" placeholder="Es. Laboratorio Arduino" onChange={(e) => setNome(e.target.value)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] w-full xl:w-fit'/>

                        <label htmlFor='giorno' className='flex items-center gap-2'>Giorno:</label>
                        <select id="giorno" onChange={(e) => setGiorno(Number(e.target.value))} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] w-full xl:w-fit'>
                            <option value="0">Tutti</option>
                            <option value="1">Lunedì</option>
                            <option value="2">Martedì</option>
                            <option value="3">Mercoledì</option>
                            <option value="4">Giovedì</option>
                            <option value="5">Venerdì</option>
                            <option value="6">Sabato</option>
                        </select>

                        <label htmlFor='ora' className='flex items-center gap-2'>Ora:</label>
                        <select id="ora" onChange={(e) => setOra(Number(e.target.value))} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff ] w-full xl:w-fit'>
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
                        <select id="stato" onChange={(e) => setStato(e.target.value)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] w-full xl:w-fit'>
                            <option value="tutte">Tutte</option>
                            <option value="aperte">Aperte</option>
                            <option value="piene">Piene</option>
                            <option value="scadute">Scadute</option>
                        </select>
                    </div>
                    <ul role="list" className="flex flex-wrap gap-4 items-center justify-center w-full flex-col lg:flex-row mt-4" >
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
                                    <li className='bg-[#282828] border-solid border-gray-700 border-2 rounded-xl p-4 w-[100%] lg:w-[30%] hover:scale-105 transition-all' onClick={() => showDetails(activity.id)} key={activity.id}>
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
                                                    : <button type="button" className='mt-4 p-3 w-full cursor-pointer text-base font-medium rounded-xl bg-[#4c3fff] transition-all ease-in-out hover:scale-[1.02]'>Iscriviti</button>
                                        }
                                    </li>
                                )
                            })}
                    </ul>
                </div>
            </div>
            {
                
                showActivity ?
                <div className='fixed h-fit w-9/12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#252525] rounded-lg bg-opacity-80 text-center p-4 border-gray-400 border-2 shadow-lg max-h-[90%] overflow-y-scroll resize-none'>
                    <div className="topbar">
                        <h2 className='text-2xl font-bold'>Dettagli Attività</h2>
                        <button onClick={() => setShowActivity(false)} className='absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors duration-200 ease-in-out'>✖</button>        
                    </div>
                    
                        <form className='flex flex-col gap-4 max-h-[90%]' onSubmit={(e) => {
                            e.preventDefault()
                            e.stopPropagation()

                            if (today > closingDate || today > new Date(activities.find((activity: Activity) => activity.id === activityId)?.startTime!)) {
                                alert("Tempo per l'iscrizione terminato! Iscrizioni chiuse")
                                return
                            }
                            subscribeToEvent(activityId)
                        }}>
                        <label htmlFor='nome' className='flex items-center gap-2'>Nome Attività: </label>
                        <input type="text" id="nome" placeholder="Es. Laboratorio Arduino" contentEditable={false} value={nomeEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />
                    
                        <label htmlFor='aula' className='flex items-center gap-2'>Aula: </label>
                        <input type="text" id="aula" placeholder="Es. A05" contentEditable={false} value={aulaEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />
                    
                        <label htmlFor='desc' className='flex items-center gap-2'>Descrizione: </label>
                        <textarea id="desc" rows={5} placeholder="Descrizione Attività" contentEditable={false} value={descEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] h-fit'></textarea>

                        <label htmlFor='data' className='flex items-center gap-2'>Data: </label>
                        <input type="date" id="data" contentEditable={false} value={dataEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] overflow-y-scroll whitespace-nowrap' />

                        <label htmlFor='oraInizio' className='flex items-center gap-2'>Ora Inizio: </label>
                        <input type="time" id="oraInizio" contentEditable={false} value={oraInizioEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <label htmlFor='oraFine' className='flex items-center gap-2'>Ora Fine: </label>
                        <input type="time" id="oraFine"  contentEditable={false} value={oraFineEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <label htmlFor='maxIscritti' className='flex items-center gap-2'>Max Iscritti: </label>
                        <input type="number" id="maxIscritti" placeholder="Es. 20" value={Number(maxIscrittiEdit)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />
                    
                        {        
                            today > closingDate || today > new Date(activities.find((activity: Activity) => activity.id === activityId)?.startTime!)
                                ? <button type="button" disabled className='mt-4 p-3 w-full cursor-not-allowed text-base font-medium rounded-xl bg-[#ff0000]'>Tempo per l&apos;iscrizione terminato! Iscrizioni chiuse</button>
                                : activities.find((activity: Activity) => activity.id === activityId)?._count?.subscriptions! >= activities.find((activity: Activity) => activity.id === activityId)?.maxNumber
                                    ? <button type="button" disabled className='mt-4 p-3 w-full cursor-not-allowed text-base font-medium rounded-xl bg-[#ff0000]'>Attività Piena! Iscrizioni chiuse</button>
                                    : <button onClick={() => subscribeToEvent(activityId)} type="submit" className='mt-4 p-3 w-full cursor-pointer text-base font-medium rounded-xl bg-[#4c3fff] transition-all ease-in-out hover:scale-[1.02]'>Iscriviti</button>
                        }
                        </form>
                </div> : ''
            }
        </>
    )
}