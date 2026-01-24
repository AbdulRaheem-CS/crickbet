import { redirect } from 'next/navigation';
import ClientFallbackRedirect from '../ClientFallbackRedirect';

export default function JoinRedirect({ params }: { params?: { code?: string } }) {
  const code = params?.code || '';

  // If we have a code on the server, perform a server-side redirect for best UX.
  if (code) {
    return redirect(`/register?ref=${encodeURIComponent(code)}`);
  }

  // Fallback: render a small client-side redirect component which will
  // extract the code from the current URL (if available) and navigate to
  // /register?ref=<code>. This prevents cases where params are undefined
  // (client-side navigation or unexpected bundling) and would otherwise
  // produce /register?ref= with an empty value.
  return <ClientFallbackRedirect pattern="/af/([^/]+)/join" queryKey="ref" />;
}
