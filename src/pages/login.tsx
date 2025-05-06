import type { NextPage } from 'next';
import { signIn } from 'next-auth/react';
import GoogleButton from 'react-google-button';
import Image from "next/image";

const Login: NextPage = () => {
    const adminLogin = () => {
        const password = prompt("Inserisci la password per accedere come admin");
    
        // Check if the password is correct via api call
        // If the password is correct, sign in as admin

        fetch("/api/admin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ password }),
        })
        .then((res) => {
            if (res.status === 200) {
                signIn("credentials", {
                    email: "admin@einaudicorreggio.it",
                    redirect: true,
                    callbackUrl: "/", // dove vuoi reindirizzare dopo login
                });
            } else {
                alert("Password errata");
            }
        })
    }

    return (
        <>
        <div className='min-h-screen h-full w-full flex flex-col justify-center items-center bg-[#181818]'>
            <div className='flex flex-col justify-evenly items-center space-y-4 px-4'>
                <Image
                    src="/logo.png"
                    width={600}
                    height={600}
                    alt="Logo Einaudi"
                    />
                
                <h1 className='font-semibold text-lg text-center'>Per continuare accedi con il tuo 
                    <span className="underline decoration-1 text-yellow-200 m-1">ACCOUNT ISTITUZIONALE</span>
                </h1>
                
                <GoogleButton
                    label='Accedi alle Attività'
                    type='dark'
                    onClick={() => signIn('google')}
                    />
            </div>
            <p className="mt-2 cursor-pointer" onClick={() => adminLogin()}>Sei un <span className="underline">ADMIN?</span></p>  
            <footer className='w-full mt-4 flex justify-center items-center p-4 border-t-2 border-solid border-[#aaa] bg-[#181818]'>
                <p className='text-[#666]'>Realizzato da <a href="https://www.instagram.com/fabri.gaspa_/" className="underline decoration-1 transition-all hover:text-white hover:text-lg" > Fabrizio Gasparini</a> e <a href="https://www.instagram.com/manu_ghizzo/" className="underline decoration-1 transition-all hover:text-white hover:text-lg">Manuel Ghizzoni</a></p>
            </footer>
        </div>
        </>
    );
};

export default Login;