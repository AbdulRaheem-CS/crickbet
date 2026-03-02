export default function SponsorshipPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Sponsorship</h1>
        <p className="text-gray-400">Sponsorship details for: {params.slug}</p>
      </div>
    </div>
  );
}
