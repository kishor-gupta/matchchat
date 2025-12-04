export default function Home() {
  return (

    <div aria-label="homeCard" className="flex justify-center items-center min-h-screen">
      <div className="p-8 rounded-lg text-center shadow-md ">
        <h2>Welcome to MatchChat!</h2>
        <p>Connect with people around the world in real-time.</p>
        <button type="button" className="text-white bg-blue-600 box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-full text-sm px-4 py-2.5 focus:outline-none ">Start chat</button>
      </div>
    </div>

  );
}
