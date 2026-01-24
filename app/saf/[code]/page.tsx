import { redirect } from 'next/navigation';
import ClientFallbackRedirect from '../../af/ClientFallbackRedirect';

export default function SafRedirect({ params }: { params?: { code?: string } }) {
  const code = params?.code || '';

  if (code) {
    return redirect(`/register?ref=${encodeURIComponent(code)}`);
  }

  return <ClientFallbackRedirect pattern="/saf/([^/]+)" queryKey="ref" />;
}
