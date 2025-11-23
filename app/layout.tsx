import "../globals.css";


export const metadata = {
title: "Panchang Choghadiya",
description: "Astrology timings",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body>{children}</body>
</html>
);
}