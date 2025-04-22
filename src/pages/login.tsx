import type { NextPage } from 'next';
import { signIn } from 'next-auth/react';
import GoogleButton from 'react-google-button';
import Image from "next/image";

const Login: NextPage = () => {
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
                
                <h1 className='font-semibold text-lg'>Per continuare accedi con il tuo 
                    <span className="underline decoration-1 text-yellow-200 m-1">ACCOUNT ISTITUZIONALE</span>
                </h1>
                
                <GoogleButton
                    label='Accedi alle Attività'
                    type='dark'
                    onClick={() => signIn('google')}
                    />
            </div>
            <footer className='fixed bottom-0 left-0 right-0 flex justify-center items-center p-4 border-t-2 border-solid border-[#aaa] bg-[#181818]'>
                <p className='text-[#666]'>Realizzato da <a href="https://www.instagram.com/fabri.gaspa_/" className="underline decoration-1 transition-all hover:text-white hover:text-lg" > Fabrizio Gasparini</a> e <a href="https://www.instagram.com/manu_ghizzo/" className="underline decoration-1 transition-all hover:text-white hover:text-lg">Manuel Ghizzoni</a></p>
            </footer>
        </div>
        </>
    );
};

export default Login;