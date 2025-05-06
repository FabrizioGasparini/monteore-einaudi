import useSWR from 'swr'
import { fetcher } from '../fetcher'
import { useState, useEffect } from 'react';

export type Subscription = {
    id: number;
    email: string;
    name: string;
    activity: Activity;
    activityId: number;
    position: number;
}

export type Activity = {
    id: number;
    name: string;
    description: string;
    startTime: Date;
    endTime: Date;
    duration: number;
    maxNumber: number;
    location: String;
    subscriptions?: Array<Subscription>;
    _count?: {
        subscriptions: number;
    }
}

export const closingDate = new Date("2025-05-8T18:00:00Z")

const dateOptions = { timeZone: 'UTC', month: 'long', weekday:'long', day: 'numeric', year: 'numeric'};

export const formatDate = (date: Date) => {
    return date.toLocaleString([], dateOptions as any)
}

export const formatTime = (date: Date) => {
    return `${date.getHours() > 9 ? date.getHours() : "0" + date.getHours().toString()}:${date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes().toString()}`
}

export default function ManageActivities() {
    const { data: activities, isValidating, error } = useSWR('/api/activities', fetcher);
    const [giorno, setGiorno] = useState(0)
    const [ora, setOra] = useState(0)
    const [nome, setNome] = useState("")
    const [stato, setStato] = useState("tutte")

    const [nomeEdit, setNomeEdit] = useState("")
    const [aulaEdit, setAulaEdit] = useState("")
    const [descEdit, setDescEdit] = useState("")
    const [dataEdit, setDataEdit] = useState("")
    const [oraInizioEdit, setOraInizioEdit] = useState("")
    const [oraFineEdit, setOraFineEdit] = useState("")
    const [durataEdit, setDurataEdit] = useState(0)
    const [maxIscrittiEdit, setMaxIscrittiEdit] = useState(0)
    
    const [position, setPosition] = useState(0)
    const [currentSubscriptionsCount, setCurrentSubscriptionsCount] = useState(0)
    const [maxDurataEdit, setMaxDurataEdit] = useState(0)
    
    const [isEditing, setIsEditing] = useState(false)
    const [isWatching, setIsWatching] = useState(false)
    const [activityId, setActivityId] = useState(0)
    const [isCreating, setIsCreating] = useState(false)
    
    const [dataChiusura, setDataChiusura] = useState("")
    const [oraChiusura, setOraChiusura] = useState("")

    
    useEffect(() => {
        const getChiusura = async () => {
            const res = await fetch("/api/closingDate", {
                credentials: 'include',
                method: "GET",
                cache: "no-cache",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                })
            })
            const data = await res.json()
            setDataChiusura(data.date)
            setOraChiusura(data.time)
        }

        getChiusura()
    }, [dataChiusura, oraChiusura])

    if (isValidating) return <span>Carico dati...</span>
    if (error) return <span>Si è verificato un errore: {error}</span>

    const editEvent = (id: number) => {
        fetch("/api/edit", {
            credentials: 'include',
            method: "PUT",
            body: JSON.stringify({ id, name: nomeEdit, aula: aulaEdit, duration: durataEdit, desc:descEdit, date: dataEdit, startTime: oraInizioEdit, endTime: oraFineEdit, maxNumber: maxIscrittiEdit }),
            cache: "no-cache",
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json"
            })
        })
            .then((res) => { return res.json() })
            .then((data) => {
                window.location.reload()
                return data
            })
            .catch((e) => {
                alert("Si è verificato un errore. Riprova")
            })
    }

    const editActivity = (id: number) => {
        setNomeEdit(activities.find((activity: Activity) => activity.id === id)?.name!)
        setAulaEdit(activities.find((activity: Activity) => activity.id === id)?.location!)
        setDescEdit(activities.find((activity: Activity) => activity.id === id)?.description!)

        const startTime = new Date(activities.find((activity: Activity) => activity.id === id)?.startTime!)
        setDataEdit(startTime.toISOString().split('T')[0])
        setOraInizioEdit(new Date(activities.find((activity: Activity) => activity.id === id)?.startTime!).toLocaleTimeString([], { 'hour': '2-digit', 'minute': '2-digit' }))
        setOraFineEdit(new Date(activities.find((activity: Activity) => activity.id === id)?.endTime!).toLocaleTimeString([], { 'hour': '2-digit', 'minute': '2-digit' }))
        setMaxIscrittiEdit(activities.find((activity: Activity) => activity.id === id)?.maxNumber!)
        setActivityId(id)
        setDurataEdit(activities.find((activity: Activity) => activity.id === id)?.duration!)
        setMaxDurataEdit(new Date(activities.find((activity: Activity) => activity.id === id)?.endTime!).getHours() - new Date(activities.find((activity: Activity) => activity.id === id)?.startTime!).getHours())
    
        setIsEditing(true)
        setIsCreating(false)
    }


    const createActivity = () => {
        setIsEditing(true)
        setIsCreating(true)
        setNomeEdit("")
        setAulaEdit("")
        setDescEdit("")
        setDurataEdit(0)
        setDataEdit("2025-05-12")
        setOraInizioEdit("08:00")
        setOraFineEdit("12:00")
        setMaxIscrittiEdit(0)
    }

    const createEvent = () => {
        fetch("/api/create", {
            credentials: 'include',
            method: "POST",
            body: JSON.stringify({ name: nomeEdit, aula: aulaEdit, desc:descEdit, duration: durataEdit, date: dataEdit, startTime: oraInizioEdit, endTime: oraFineEdit, maxNumber: maxIscrittiEdit }),
            cache: "no-cache",
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json"
            })
        })
            .then((res) => { return res.json() })
            .then((data) => {
                window.location.reload()
                return data
            })
            .catch((e) => {
                alert("Si è verificato un errore. Riprova")
            })
    }

    const deleteActivity = (id: number) => {
        setIsEditing(false)
        setIsCreating(false)
        setIsWatching(false)

        if (confirm("Sei sicuro di voler eliminare l'attività?")) {
            fetch("/api/delete", {
                credentials: 'include',
                method: "DELETE",
                body: JSON.stringify({ id }),
                cache: "no-cache",
                headers: new Headers({
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                })
            })
                .then((res) => { return res.json() })
                .then((data) => {
                    window.location.reload()
                    return data
                })
                .catch((e) => {
                    alert("Si è verificato un errore. Riprova")
                })
        }
    }

    const watchActivity = (id: number) => {
        setMaxDurataEdit(new Date(activities.find((activity: Activity) => activity.id === id)?.endTime!).getHours() - new Date(activities.find((activity: Activity) => activity.id === id)?.startTime!).getHours())
        setDurataEdit(activities.find((activity: Activity) => activity.id === id)?.duration!)
        changePosition(id, 0)
        setIsWatching(true)
        setIsEditing(false)
        setActivityId(id)
    }

    const generateExcel = () => {
        fetch("/api/generate", {
            credentials: 'include',
            method: "GET",
            cache: "no-cache",
            headers: new Headers({
                "Accept": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            })
        })
            .then((response) => {
                response.blob().then((blob) => {
                  let url = window.URL.createObjectURL(blob);
                  let a = document.createElement("a");
                  a.href = url;
                  a.download = `dati_monteore_${new Date().toISOString().split("T")[0]}.xlsx`;
                  a.click();
                });
            })
            .catch((e) => {
                alert("Si è verificato un errore. Riprova")
            })
    }

    const changePosition = (id: number, pos: number) => {
        setPosition(pos)

        let count = 0
        for (let i = 0; i < activities.find((activity: Activity) => activity.id === id)?.subscriptions!.length; i++) {
            const subscription = activities.find((activity: Activity) => activity.id === id)?.subscriptions[i];
            if(subscription.position == pos) count += 1
        }

        setCurrentSubscriptionsCount(count)
    }

    const cambiaChiusura = (date: string, ora: string) => {
        const newDate = new Date(date)
        const newOra = ora.split(":")
        newDate.setHours(Number(newOra[0]), Number(newOra[1]), 0, 0)

        /*if (newDate.getTime() < new Date().getTime()) {
            alert("La data di chiusura non può essere nel passato")
            return
        }*/

        fetch("/api/closingDate", {
            credentials: 'include',
            method: "PUT",
            body: JSON.stringify({ date, time: ora }),
            cache: "no-cache",
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json"
            })
        })
            .then((res) => { return res.json() })
            .then((data) => {
                return data
            })
            .catch((e) => {
                alert("Si è verificato un errore. Riprova")
            })

        setDataChiusura(date)
        setOraChiusura(ora)
    }
    

    const today = new Date()
    return (
        <>
            <div className='min-h-screen h-full flex flex-col px-4 py-4 w-full'>
                <div className="shadow overflow-hidden sm:rounded-md">
                <div className="flex flex-wrap gap-4 justify-center items-center p-4 mx-4">
                        <label htmlFor='nome' className='flex items-center gap-2'>Cerca per nome: </label>
                        <input type="text" id="nome" placeholder="Es. Laboratorio Arduino" onChange={(e) => setNome(e.target.value)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] w-full xl:w-fit'/>

                        {/*<label htmlFor='giorno' className='flex items-center gap-2'>Giorno:</label>
                        <select id="giorno" onChange={(e) => setGiorno(Number(e.target.value))} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] w-full xl:w-fit'>
                            <option value="0">Tutti</option>
                            <option value="1">Lunedì</option>
                            <option value="2">Martedì</option>
                            <option value="3">Mercoledì</option>
                            <option value="4">Giovedì</option>
                            <option value="5">Venerdì</option>
                            <option value="6">Sabato</option>
                        </select>*/}

                        <label htmlFor='ora' className='flex items-center gap-2'>Ora:</label>
                        <select id="ora" onChange={(e) => setOra(Number(e.target.value))} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] w-full xl:w-fit'>
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

                        {/*<label htmlFor='stato' className='flex items-center gap-2'>Stato Iscrizioni:</label>
                        <select id="stato" onChange={(e) => setStato(e.target.value)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] w-full xl:w-fit'>
                            <option value="tutte">Tutte</option>
                            <option value="aperte">Aperte</option>
                            <option value="piene">Piene</option>
                            <option value="scadute">Scadute</option>
                        </select>*/}

                        <button onClick={() => generateExcel()} type="button" className='mt-4 p-3 w-11/12 cursor-pointer text-base font-medium rounded-xl bg-[#4c3fff] transition-all ease-in-out hover:scale-[1.02]'>Scarica Dati</button>
                    
                        <div className="flex w-11/12 flex-col">
                            <div className="labels flex w-full gap-2">
                                <label htmlFor='dataChiusura' className='flex items-center gap-2 flex-1'>Data Chiusura Iscrizioni: </label>
                                <label htmlFor='oraChiusura' className='flex items-center gap-2 flex-1'>Ora Chiusura Iscrizioni: </label>

                            </div>
                            <div className="values flex w-full gap-2">
                                <input type="date" id="dataChiusura" onChange={(e) => cambiaChiusura(e.target.value, oraChiusura)} value={dataChiusura} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] flex-1' />
                                <input type="time" id="oraChiusura" onChange={(e) => cambiaChiusura(dataChiusura, e.target.value)} value={oraChiusura} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff] flex-1' />
                            </div>
                        </div>
                    </div>
                    <ul role="list" className="flex flex-wrap gap-4 items-center justify-center w-full mt-4" >
                        <li className='bg-[#282828] border-solid border-gray-700 border-2 rounded-xl p-4 w-[100%] lg:w-[30%]'>
                            <h3 title="Crea Attività" className='my-2 text-xl font-bold text-ellipsis overflow-hidden whitespace-nowrap'>Crea Attività</h3>
                            <div className="text-sm text-gray-400 mx-1">📍 Aula</div>
                            <div className="text-sm text-gray-400 mx-1">📆 Data</div>
                            <div className="text-sm text-gray-400 mx-1">⏰ Orario</div>
                            <span className='mt-4 p-1 w-full text-base font-regular rounded-xl text-[#00ff00]'>Crea una nuova attività!</span>
                            <button onClick={() => createActivity()} type="button" className='mt-4 p-3 w-full cursor-pointer text-base font-medium rounded-xl bg-[#00e200] transition-all ease-in-out hover:scale-[1.02]'>Crea</button>
                        </li>
                        {activities
                            .filter((activity: Activity) => {
                                const startDate = new Date(activity.startTime)
                                const endDate = new Date(activity.endTime)
                                
                                const nomeMatch = nome == "" || activity.name.toLowerCase().includes(nome.toLowerCase()) || activity.location.toLowerCase().includes(nome.toLowerCase()) 
                                const giornoMatch = true //giorno == 0 || startDate.getDay() == giorno
                                const oraMatch = ora == 0 || startDate.getHours() == ora || (startDate.getHours() <= ora && endDate.getHours() > ora)
                                const chiuseMatch = true //stato == "tutte" || (stato == "aperte" && activity._count?.subscriptions! < activity.maxNumber && today < closingDate && today < startDate) || (stato == "piene" && activity._count?.subscriptions! >= activity.maxNumber) || (stato == "scadute" && (today >= closingDate || today >= startDate) )  //!nascondiChiuse || today < closingDate && today < startDate && activity._count?.subscriptions! < activity.maxNumber

                                return nomeMatch && giornoMatch && oraMatch && chiuseMatch;
                            })
                            .map((activity: Activity) => {
                                const startTime = new Date(activity.startTime);
                                const endTime = new Date(activity.endTime);
                                return (
                                    <li className='bg-[#282828] border-solid border-gray-700 border-2 rounded-xl p-4 w-[100%] lg:w-[30%]' key={activity.id}>
                                        <h3 title={activity.name} className='my-2 text-xl font-bold text-ellipsis overflow-hidden whitespace-nowrap'>{activity.name}</h3>
                                        <div className="text-sm text-gray-400 mx-1">📍 {activity.location.toUpperCase()}</div>
                                        <div className="text-sm text-gray-400 mx-1">📆 {formatDate(startTime).toUpperCase()}</div>
                                        <div className="text-sm text-gray-400 mx-1">⏰ {formatTime(startTime)}-{formatTime(endTime)}</div>
                                        {                                       
                                            today > closingDate || today > startTime
                                                ? <span className='mt-4 p-1 w-full cursor-not-allowed text-base font-regular rounded-xl text-[#ff0000]'>Tempo per l&apos;iscrizione terminato! Iscrizioni chiuse</span>
                                                : <span className='mt-4 p-1 w-full text-base font-regular rounded-xl text-[#00ff00]'>Iscrizioni aperte</span>
                                               /* : activity._count!.subscriptions >= activity.maxNumber
                                                    ? <span className='mt-4 p-1 w-full cursor-not-allowed text-base font-regular rounded-xl text-[#ff0000]'>Attività Piena! Iscrizioni chiuse</span>
                                                */
                                        }
                                        <div className="flex gap-1 lg:gap-2 flex-col lg:flex-row">
                                            <button onClick={() => watchActivity(activity.id)} type="button" className='mt-4 p-3 w-full lg:w-1/4 cursor-pointer text-base font-medium rounded-xl bg-[#00e200] transition-all ease-in-out hover:scale-[1.05]'>Attività</button>
                                            <button onClick={() => editActivity(activity.id)} type="button" className='mt-4 p-3 w-full lg:w-1/2 cursor-pointer text-base font-medium rounded-xl bg-[#4c3fff] transition-all ease-in-out hover:scale-[1.02]'>Modifica</button>
                                            <button onClick={() => deleteActivity(activity.id)} type="button" className='mt-4 p-3 w-full lg:w-1/4 cursor-pointer text-base font-medium rounded-xl bg-[#ff0000] transition-all ease-in-out hover:scale-[1.05]'>Elimina</button>
                                        </div>
                                    </li>
                                )
                            })}
                    </ul>
                </div>
            </div>
            {
                isEditing ?
                <div className='fixed h-auto w-9/12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#252525] rounded-lg bg-opacity-80 text-center p-4 border-gray-400 border-2 shadow-lg max-h-[90%] overflow-y-scroll'>
                    <div className="topbar">
                        <h2 className='text-2xl font-bold'>{isCreating ? "Crea" : "Modifica"} Attività</h2>
                        <button onClick={() => setIsEditing(false)} className='absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors duration-200 ease-in-out font-black'>X</button>        
                    </div>
                    
                    <form className='flex flex-col gap-4' onSubmit={(e) => {
                            e.preventDefault()
                            
                            if (isCreating) createEvent()
                            else editEvent(activityId)
                            
                            setIsEditing(false)
                    }}>
                            
                        <label htmlFor='nome' className='flex items-center gap-2'>Nome Attività: </label>
                        <input type="text" id="nome" placeholder="Es. Laboratorio Arduino" onChange={(e) => setNomeEdit(e.target.value)} value={nomeEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />
                    
                        <label htmlFor='aula' className='flex items-center gap-2'>Aula: </label>
                        <input type="text" id="aula" placeholder="Es. A05" onChange={(e) => setAulaEdit(e.target.value)} value={aulaEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />
                    
                        <label htmlFor='desc' className='flex items-center gap-2'>Descrizione: </label>
                        <textarea id="desc" placeholder="Descrizione Attività" onChange={(e) => setDescEdit(e.target.value)} value={descEdit} rows={5} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <label htmlFor='data' className='flex items-center gap-2'>Data: </label>
                        <input type="date" id="data" onChange={(e) => setDataEdit(e.target.value)} value={dataEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <label htmlFor='oraInizio' className='flex items-center gap-2'>Ora Inizio: </label>
                        <input type="time" id="oraInizio" onChange={(e) => setOraInizioEdit(e.target.value)} value={oraInizioEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <label htmlFor='oraFine' className='flex items-center gap-2'>Ora Fine: </label>
                        <input type="time" id="oraFine" onChange={(e) => setOraFineEdit(e.target.value)} value={oraFineEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <label htmlFor='durata' className='flex items-center gap-2'>Durata: </label>
                        <input type="number" id="durata" onChange={(e) => setDurataEdit(Number(e.target.value))} value={durataEdit} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <label htmlFor='maxIscritti' className='flex items-center gap-2'>Max Iscritti: </label>
                        <input type="number" id="maxIscritti" placeholder="Es. 20" onChange={(e) => setMaxIscrittiEdit(Number(e.target.value))} value={Number(maxIscrittiEdit)} className='text-black py-2 px-4 border-2 border-gray-300 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none focus:border-[#007bff]' />

                        <button type="submit" className='mt-4 p-3 w-full cursor-pointer text-base font-medium rounded-xl bg-[#4c3fff]'>{isCreating ? "Crea Attività"  : "Salva Modifiche"}</button>
                    </form>
                </div> : ''
            }
            {
                isWatching ?
                <div className='fixed h-auto w-9/12 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#252525] rounded-lg bg-opacity-80 text-center p-4 border-gray-400 border-2 shadow-lg max-h-[90%] overflow-y-scroll'>
                    <div className="topbar mb-2">
                        <h2 className='text-2xl font-bold'>Partecipanti Attività</h2>
                        <button onClick={() => setIsWatching(false)} className='absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors duration-200 ease-in-out '>X</button>        
                    </div>
                    <label htmlFor='durata' className='flex items-center gap-2 w-full justify-center'>SELEZIONA ORARIO: </label>
                    <select id="durata" defaultValue="0" className='text-black py-2 px-4 border-4 rounded-md min-w-[100px] transition-all duration-200 ease-in-out focus:outline-none border-[#007bff]' onChange={(e) => changePosition(activityId, Number(e.target.value))}>
                        {
                            [...Array((maxDurataEdit) / durataEdit)].map((x, i) => <option value={i.toString()} key={i}>{formatTime(new Date(0, 0, 0, new Date(activities.find((activity: Activity) => activity.id === activityId)?.startTime).getHours() + durataEdit * (i), new Date(activities.find((activity: Activity) => activity.id === activityId)?.startTime).getMinutes()))} - {formatTime(new Date(0, 0, 0, new Date(activities.find((activity: Activity) => activity.id === activityId)?.startTime).getHours() + durataEdit * (i + 1), new Date(activities.find((activity: Activity) => activity.id === activityId)?.startTime).getMinutes()))}</option>)
                        }
                    </select>
                    <ul role="list" className="flex flex-wrap gap-4 mt-4 items-center justify-center w-full overflow-y-scroll max-h-[90%] h-auto" >
                            {
                            activities.find((activity: Activity) => activity.id == activityId).subscriptions?.length == 0 ? <p>Nessuna iscrizione trovata</p> :
                            activities.find((activity: Activity) => activity.id == activityId).subscriptions?.map((subscription: Subscription) => {
                                if(subscription.position != position) return
                                
                                return (
                                    <li className='bg-[#282828] border-solid border-gray-700 border-2 rounded-xl p-4 w-full lg:w-[30%]' key={subscription.id}>
                                        <h3 title={subscription.name} className='my-2 text-xl font-bold text-ellipsis overflow-hidden whitespace-nowrap'>{subscription.name}</h3>
                                        <div className="text-sm text-gray-400 mx-1">📧 {subscription.email}</div>
                                    </li>
                                )
                            })
                        }
                    </ul>
                  
                </div> : ''
            }
        </>
    )
}