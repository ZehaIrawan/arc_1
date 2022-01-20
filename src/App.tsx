import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React from 'react';
import { storage } from './base';
import Home from './components/Home';

function App() {
  const [progress, setProgress] = React.useState(0);

  const uploadFiles = (file: any) => {
    //
    if (!file) return;
    const sotrageRef = ref(storage, `files/${file.name}`);
    const uploadTask = uploadBytesResumable(sotrageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        setProgress(prog);
      },
      (error) => console.log(error),
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log('File available at', downloadURL);
        });
      },
    );
  };

  const formHandler = (e: any) => {
    e.preventDefault();
    const file = e.target[0].files[0];
    uploadFiles(file);
  };

  return (
    <>
      <Home />
      <form onSubmit={formHandler}>
        <input type="file" />
        <button type="submit">Upload</button>
      </form>
      <hr />
      <h2>
        Uploading done
        {progress}
        %
      </h2>
    </>
  );
}

export default App;
