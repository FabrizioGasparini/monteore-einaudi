import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react';
import { AuthGuard } from '../components/AuthGuard';
import Head from 'next/head';

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return <div className='min-h-screen h-full w-full'>
     <SessionProvider session={session}>
        <AuthGuard>
        <Head>
          <title key={"title"}>Monteore Einaudi</title>
          <meta name="description" content="Iscriviti al monteore einaudi" />
          <link rel="icon" href="/logo.ico" />
          <link href='https://fonts.googleapis.com/css?family=Lexend' rel='stylesheet' />
        </Head>
          <Component {...pageProps} />
        </AuthGuard>
    </SessionProvider>
    </div>
}

export default MyApp
