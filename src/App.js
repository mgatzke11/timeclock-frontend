import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth, signInWithGoogle } from "./firebase";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes } from "firebase/storage";

const db = getFirestore();
const storage = getStorage();

export default function TimeclockApp() {
  const [user, setUser] = useState(null);
  const [clockedInProgram, setClockedInProgram] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [clockInTime, setClockInTime] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [newProgramName, setNewProgramName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(setUser);
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const programCollection = collection(db, "programs");
    const programSnapshot = await getDocs(programCollection);
    const programList = programSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPrograms(programList);
  };

  const handleClockIn = async (program) => {
    if (!user) return alert("You must sign in first");
    setClockedInProgram(program);
    setClockInTime(Date.now());
    
    const userRef = doc(db, "employees", user.uid, "clock-ins", program.id);
    await setDoc(userRef, {
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

  const handleClockOut = async () => {
    if (!clockedInProgram) return;
    const userRef = doc(db, "employees", user.uid, "clock-ins", clockedInProgram.id);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      const clockInTimestamp = docSnap.data().clockIn;
      const duration = (Date.now() - clockInTimestamp.toMillis()) / 1000; // seconds
      await updateDoc(userRef, {
        clockOut: serverTimestamp(),
        duration
      });
    }

    setClockedInProgram(null);
    setDocuments([]);
    setClockInTime(null);
  };

  const handleAddProgram = async () => {
    if (!newProgramName) return;
    const newProgramRef = await addDoc(collection(db, "programs"), { name: newProgramName, documents: [] });
    setPrograms([...programs, { id: newProgramRef.id, name: newProgramName, documents: [] }]);
    setNewProgramName("");
  };

  const handleRemoveProgram = async (programId) => {
    await deleteDoc(doc(db, "programs", programId));
    setPrograms(programs.filter(program => program.id !== programId));
  };

  const handleFileUpload = async (programId) => {
    if (!file) return;
    const fileRef = ref(storage, `secure_docs/${file.name}`);
    await uploadBytes(fileRef, file);
    const programRef = doc(db, "programs", programId);
    const programSnap = await getDoc(programRef);
    if (programSnap.exists()) {
      await updateDoc(programRef, {
        documents: [...programSnap.data().documents, file.name]
      });
    }
    setFile(null);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-bold">Employee Time Clock</h2>
          {!user ? (
            <Button onClick={signInWithGoogle}>Sign in with Google</Button>
          ) : (
            <>
              <p>Welcome, {user.displayName}</p>
              <div className="space-y-2">
                {programs.map((program) => (
                  <div key={program.id} className="flex justify-between items-center border p-2 rounded-lg">
                    <span>{program.name}</span>
                    {clockedInProgram?.id === program.id ? (
                      <Button onClick={handleClockOut} variant="destructive">Clock Out</Button>
                    ) : (
                      <Button onClick={() => handleClockIn(program)}>Clock In</Button>
                    )}
                    <Button onClick={() => handleRemoveProgram(program.id)} variant="secondary">Remove</Button>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                    <Button onClick={() => handleFileUpload(program.id)}>Upload File</Button>
                  </div>
                ))}
              </div>
              {clockedInProgram && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h3 className="text-lg font-semibold">Documents for {clockedInProgram.name}</h3>
                  <ul className="list-disc pl-5">
                    {documents.map((docUrl, index) => (
                      <li key={index}><a href={docUrl} target="_blank" rel="noopener noreferrer">Document {index + 1}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              <Input placeholder="New Program Name" value={newProgramName} onChange={(e) => setNewProgramName(e.target.value)} />
              <Button onClick={handleAddProgram}>Add Program</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
