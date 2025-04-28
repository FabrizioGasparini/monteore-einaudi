import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { signOut } from "next-auth/react"
import Image from 'next/image'
import logoOrizzontale from "../../public/logo_orizzontale.png"
import { useEffect, useState } from 'react'
import Activities from './activities'
import MyActivities from './myactivities'
import ManageActivities from './manage'

const Home: NextPage = () => {
    const session = useSession();
    const user = session.data;
    const [page, setPage] = useState("activities")
    const [isAdmin, setIsAdmin] = useState(false)
    
    const [classeUser, setClasseUser] = useState("")
    const name = user?.user?.name?.split(" ")[0];

    const admin = () => {
        fetch("/api/user", {
            credentials: 'include',
            method: "POST",
            body: null,
            cache: "no-cache",
            headers: new Headers({
                "Accept": "application/json",
                "Content-Type": "application/json"
            })
        })
        .then((res) => { return res.json() })
        .then((data) => {
            setClasseUser(data.user.class)
            setIsAdmin(data.admin)
            return data
        })
        .catch((e) => {
            alert("Si è verificato un errore. Riprova")
        })
    }

    useEffect(() => {
        admin()
    }, [isAdmin])

    console.log(user)

    return (
        <div className='w-full min-h-screen h-full bg-[#181818]'>
            <header className='flex items-center justify-center flex-col p-2'>
                <Image src={logoOrizzontale} alt="Logo Orizzontale" height={150} width={630} />
                <h1 className='text-6xl mt-10 text-center'>BENVENUTO {name}!</h1>
            </header>
            <main className="min-h-screen px-16 pt-8 flex-1 flex flex-col justify-center items-center text-center align-middle">
                <nav className='flex justify-center gap-8 p-4 border-b-2 border-solid border-[#aaa]'>
                    <div className={`${page == "activities" ? "text-[#ffff00]" : "text-[#666]"} font-medium pb-2 cursor-pointer`} onClick={() => setPage("activities")}>LISTA ATTIVITÀ</div>
                    <div className={`${page == "myactivities" ? "text-[#ffff00]" : "text-[#666]"} font-medium pb-2 cursor-pointer`} onClick={() => setPage("myactivities")}>LE MIE ATTIVITÀ</div>
                    {isAdmin ? <div className={`${page == "manageactivities" ? "text-[#ffff00]" : "text-[#666]"} font-medium pb-2 cursor-pointer`} onClick={() => setPage("manageactivities")}>GESTISCI ATTIVITÀ</div> : ""}
                    <div className="text-[#666] font-medium pb-2 cursor-pointer align-middle" onClick={() => signOut()}>ESCI</div>
                </nav>
                {
                    page == "activities"
                        ? <Activities email={user?.user?.email!} classe={classeUser} />
                        : page == "myactivities"
                            ? < MyActivities />
                            : < ManageActivities />
                }
            </main>
           <footer className='flex justify-center items-center p-4 border-t-2 border-solid border-[#aaa] bg-[#181818]'>
                <p className='text-[#666]'>Realizzato da <a href="https://www.instagram.com/fabri.gaspa_/" className="underline decoration-1 transition-all hover:text-white hover:text-lg"> Fabrizio Gasparini</a> e <a href="https://www.instagram.com/manu_ghizzo/" className="underline decoration-1 transition-all hover:text-white hover:text-lg">Manuel Ghizzoni</a></p>
            </footer>
        </div>
    )
}

export default Home
