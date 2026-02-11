// import React, { useState } from 'react'

export const Learn = () => {
    const userName = "lizzy"; 
  return (
    <div className='p-6'>
      <h1 className='text-3xl font-bold'>Hello, {userName}</h1>
      <p className='text-gray-600'>jsx let you write html like code inside js</p>
    </div>
  );
};

// export function Button({children, onClick, Kind = "primary"}){
//     const base = "px-4 py-2 rounded-lg font-medium transition";
//     const styles = Kind === "primary" 
//     ? "bg-blue-200 text-gray-900 hover:bg-gray-700"
//     : "bg-blue-200 text-gray-900 hover:bg-gray-300";
//     return (<button onClick={onClick} className={`${base}${styles}`}>{children}</button>);
// }

// export function Counter() {
//   const [count, setCount ] = useState(0);
//   return(
//     <div className='p-4 border rounded-lg inline-flex items-center gap-4'>
//         <span className='text-x1'>{count}</span>
//         <button className='px-3 py-1 bg-gray-100 rounded hover:bg-blue-700' onClick={() => (count + 1)}>+1</button>
//         <button className='px-3 py-1 bg-gray-100 rounded' onClick={() => (0)}>reset</button>
//     </div>
//   )
// }


// export function Toggle () {
//   const [open, setOpen] = useState(false);
//   return (
//     <div className='p-4'>
//         <button className='px-4 py-2 bg-slate-800 text-white rounded cursor-pointer' onClick={() =>  setOpen(!open)}> {open ? "Hide" : "Show"} tips </button>
//         {open && <div className='mt-3 text-sm text-gray-600 overflow-hidden'>these are some helpful tips</div>}
//     </div>
//   );
// }
// // export default learn
