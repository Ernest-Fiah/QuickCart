"use client";
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth, SignInButton } from '@clerk/nextjs';
import { useAppContext } from '@/context/AppContext';
import Loading from '@/components/Loading';
function Callback() {
  const search = useSearchParams(), router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { fetchUserData } = useAppContext();
  const [message, setMessage] = useState('Checking payment…');
  const [retry, setRetry] = useState(0);
  const reference = search.get('reference') || search.get('trxref');
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    let active = true;
    async function verify() {
      if (!reference) { setMessage('Missing payment reference.'); return; }
      setMessage('Checking payment…');
      try {
        const token = await getToken();
        const response = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const data = await response.json();
        if (!active) return;
        if (!data.success) throw new Error(data.message);
        await fetchUserData();
        router.replace('/my-orders');
      } catch (error) { if (active) setMessage(error.message || 'Unable to confirm payment. Please retry.'); }
    }
    verify();
    return () => { active = false; };
    // Refresh account only after confirmation, not when context function identities change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, isLoaded, isSignedIn, retry, router]);
  return <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
    <h1 className="text-2xl">Payment confirmation</h1>
    {!isLoaded ? <Loading /> : !isSignedIn ? <SignInButton><button className="border p-3">Sign in to check your payment</button></SignInButton> : <><p>{message}</p><button className="border p-3" onClick={() => setRetry(n => n + 1)}>Check again</button></>}
    <p className="text-sm break-all">Reference: {reference || 'Not provided'}</p>
    <p className="text-sm">If you were debited, do not pay again. Contact 055 878 8167 with this reference.</p>
    <button onClick={() => router.push('/my-orders')}>View my orders</button>
  </main>;
}
export default function Page() { return <Suspense fallback={<Loading />}><Callback /></Suspense>; }
