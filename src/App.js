import { useState } from "react";

export default function App() {
  const [user, setUser] = useState("");
  const [clockedIn, setClockedIn] = useState(false);
  const [documents, setDocuments] = useState([]);

  const handleClockIn = async () => {
    const response = await fetch("https://your-backend-url.com/clock-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    });
    if (response.ok) {
      setClockedIn(true);
    }
  };

  const fetchDocuments = async () => {
    const response = await fetch(`https://your-backend-url.com/documents?user=${user}`);
    const data = await response.json();
    setDocuments(data.documents);
  };

  return (
    <div>
      <h1>Manufacturing Timeclock</h1>
      <input
        type="text"
        placeholder="Enter Your Name"
        value={user}
        onChange={(e) => setUser(e.target.value)}
      />
      <button onClick={handleClockIn}>{clockedIn ? "Clocked In" : "Clock In"}</button>
      {clockedIn && (
        <>
          <button onClick={fetchDocuments}>View Documents</button>
          <ul>
            {documents.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
