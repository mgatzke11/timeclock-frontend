import { useState, useEffect, useContext } from "react";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { Input } from "./components/ui/Input";
import { AuthContext } from "../context/AuthContext";
import { db, storage, signInWithGoogle } from "../firebase/firebaseConfig";
import { collection, addDoc, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";

export default function TimeclockApp() {
  const { user } = useContext(AuthContext);
  const [programs, setPrograms] = useState([]);
  const [clockedInProgram, setClockedInProgram] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [newProgramName, setNewProgramName] = useState("");

  useEffect(() => {
    if (user) fetchPrograms();
  }, [user]);

  const fetchPrograms = async () => {
    const snapshot = await getDocs(collection(db, "programs"));
    setPrograms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleClockIn = async (program) => {
    if (!user) return alert("Sign in first");
    setClockedInProgram(program);

    await setDoc(doc(db, "employees", user.uid, "clock-ins", program.id), {
      programId: program.id,
      clockIn: serverTimestamp(),
      clockOut: null
    });

    const docRefs = await Promise.all(
      program.documents.map(async (docName) => {
        const docRef = ref(storage, `secure_docs/${docName}`);
        return await getDownloadURL(docRef);
      })
    );
    setDocuments(docRefs);
  };

  return (
    <Card>
      <h2>Time Clock</h2>
      {!user ? <Button onClick={signInWithGoogle}>Sign in with Google</Button> :
        <div>
          {programs.map(program => (
            <div key={program.id}>
              <span>{program.name}</span>
              <Button onClick={() => handleClockIn(program)}>Clock In</Button>
            </div>
          ))}
          <Input placeholder="New Program" value={newProgramName} onChange={e => setNewProgramName(e.target.value)} />
          <Button onClick={() => addDoc(collection(db, "programs"), { name: newProgramName, documents: [] })}>Add</Button>
        </div>
      }
    </Card>
  );
}
