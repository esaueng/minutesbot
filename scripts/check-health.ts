const url = process.env.API_BASE_URL ? `${process.env.API_BASE_URL.replace(/\/+$/, "")}/api/health` : "http://localhost:8787/api/health";
const response = await fetch(url);
const body = await response.text();
console.log(`${response.status} ${body}`);
if (!response.ok) process.exit(1);

export {};
