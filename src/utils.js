export const genId   = () => Date.now() + (Math.random()*1000|0);
export const getAvg  = s  => { const v=Object.values(s).map(x=>typeof x==="object"?x?.percentage??0:x??0); return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0; };
export const attCls  = p  => p>=75?"att-high":p>=60?"att-mid":"att-low";
export const fmtDate = d  => new Date(d).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});
export const fmtTime = t  => { if(!t)return""; const[h,m]=t.split(":"); const hr=+h; return `${hr>12?hr-12:hr}:${m} ${hr>=12?"PM":"AM"}`; };
export const initials= n  => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
export const today   = () => new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
