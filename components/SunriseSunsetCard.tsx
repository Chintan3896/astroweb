export default function SunriseSunsetCard({ sunrise, sunset }: any) {
    return (
    <div className="bg-panel backdrop-blur-xl rounded-2xl shadow p-6 border border-white/40 mb-6">
    <h2 className="font-semibold text-xl mb-4">Sunrise & Sunset</h2>
    <div className="flex justify-between text-sm">
    <div className="px-3 py-1 bg-yellow-100 rounded-md font-medium">Sunrise: {sunrise}</div>
    <div className="px-3 py-1 bg-orange-100 rounded-md font-medium">Sunset: {sunset}</div>
    </div>
    </div>
    );
    }