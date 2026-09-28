import type {Metadata} from 'next';
import {Suspense} from 'react';
import {Providers} from './providers';
import './globals.css';
export const metadata:Metadata={title:'AOLMS',description:'Operations management',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" suppressHydrationWarning><body><div id="root"><Providers><Suspense fallback={<div role="status" className="p-6">Loading page…</div>}>{children}</Suspense></Providers></div></body></html>;
}
