// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { v4 } from "uuid";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAlzCnBq-K9coblDZ7HJiDs6pX19HX09NI",
  authDomain: "where-s-waldo-1ba1a.firebaseapp.com",
  projectId: "where-s-waldo-1ba1a",
  storageBucket: "where-s-waldo-1ba1a.appspot.com",
  messagingSenderId: "348703818247",
  appId: "1:348703818247:web:039ffbcabee1733d6420a2",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export async function getImagesList(): Promise<Image[]> {
  const imagesQuerySnapshot = await getDocs(collection(db, "images"));
  return imagesQuerySnapshot.docs.map((doc) => doc.data()) as Image[];
}

export async function getImage(imageID: string): Promise<Image> {
  const imageRef = doc(db, "images", imageID);
  const image = await getDoc(imageRef);
  return image.data() as Image;
}

function LeaderboardEntry(name: string, time: number, id: string) {
  return { name, time, id };
}

export async function leaderboardPageEntriesOnSnapshot(
  imageID: string,
  callback: Function
) {
  const leaderboardRef = collection(db, "images", imageID, "leaderboard");

  onSnapshot(leaderboardRef, (snapshot) => {
    const leaderboardEntries: LeaderboardEntry[] = [];
    snapshot.docChanges().forEach((change) => {
      leaderboardEntries.push(change.doc.data() as LeaderboardEntry);
    });
    callback(leaderboardEntries);
  });
}

export async function submitLeaderboardEntry(
  imageID: string,
  name: string,
  time: number,
  id: string
) {
  const leaderboardRef = collection(db, "images", imageID, "leaderboard");
  const leaderboardEntry = LeaderboardEntry(name, time, id);
  await addDoc(leaderboardRef, leaderboardEntry);
  return leaderboardEntry;
}
