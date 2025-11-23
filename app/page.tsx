import SunriseSunsetCard from "../components/SunriseSunsetCard";
import MuhuratCard from "../components/MuhuratCard";


export default function Home() {
const data = []; // <-- Replace with your actual data


return (
<main className="max-w-6xl mx-auto py-10 px-4">
<h1 className="text-3xl font-bold text-center mb-6">Panchang Choghadiya</h1>


<div className="flex justify-center mb-3">
<input
type="text"
className="border px-3 py-2 rounded-lg shadow-sm"
value={new Date().toLocaleDateString()}
/>
</div>


<p className="text-center text-muted mb-6">Location: Lat 19.xxxx, Lon 72.xxxx</p>


<SunriseSunsetCard sunrise="06:52:13" sunset="18:00:39" />


<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
{data.map((item, index) => (
<MuhuratCard
key={index}
title={item.name}
start={item.start}
end={item.end}
type={item.type}
/>
))}
</div>
</main>
);
}