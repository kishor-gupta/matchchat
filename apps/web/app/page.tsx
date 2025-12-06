import StartChatComponent from "./components/StartChat.component";

export default function Home() {
  return (

    <div aria-label="homeCard" className="flex justify-center items-center min-h-screen">
      <div className="p-8 rounded-lg text-center shadow-md ">
        <h2>Welcome to MatchChat!</h2>
        <p>Connect with people around the world in real-time with 0 personal data shared.</p>
        <StartChatComponent />
      </div>
    </div>

  );
}
