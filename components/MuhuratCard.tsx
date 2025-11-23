import React from "react";


export default function MuhuratCard({ title, start, end, type }: any) {
const colorMap: any = {
Good: "bg-green-50 border-green-200",
"Very Good": "bg-green-100 border-green-300",
Normal: "bg-blue-50 border-blue-200",
Bad: "bg-red-50 border-red-200",
};


return (
<div
className={`border p-4 rounded-xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
colorMap[type] || "bg-white/70 border-gray-200"
}`}
>
<h3 className="font-semibold text-lg mb-1">{title}</h3>
<p className="text-sm text-muted">Start: {start}</p>
<p className="text-sm text-muted">End: {end}</p>
<div className="mt-3 text-center font-semibold text-md">{type}</div>
</div>
);
}