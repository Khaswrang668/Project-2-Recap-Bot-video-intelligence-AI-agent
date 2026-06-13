import { use, useState } from 'react'
import axios from 'axios';
import './App.css'

function App() {
  const [uploaded_video,setVideo] = useState(null);
  const [text,setText] = useState('hello world');

  const handleFileChange = (e)=>{
    setVideo(e.target.file[0]);
  }

  const getVideoId = async()=>{
    await axios.get("http://localhost:3000/api/v1/get-video-data")
    .then(response=>{
      console.log(response.videoId);
      return response.videoId;
    })
    .catch(error=>{console.error(`An error occured ${error}`)})
  }

  const handleUpload = async(e)=>{
    e.preventDefault();
    
    //First get the server issued Id
    const videoId = await getVideoId();
    
    if(!videoId) {
      console.error('An error has occurred')
    }
    
    const formData = new FormData();
    formData.append('uploaded_video',uploaded_video);

    await axios.post(
      `http://localhost:3000/api/v1/videos/${videoId}/process-video`,
      formData
    )
    .then(response => {
      console.log(response);
      setText(response.transcript);
    })
    .catch(error => console.error(`An error has occured ${error}`))
  }

  return (
    <>
    <div className='container'>
    <form encType='multipart/form-data' className='upload-form' name='uploaded_file'>
     <label htmlFor="videoInt" className='upload-label'>Upload your video</label>
     <br />
     <input type="file" name='videoInt' className='upload-file-intput' onChange={handleFileChange}></input>
     <br />
     <button type='submit' value='Upload file' className='upload-btn' onClick={handleUpload}>Upload</button>
    </form>
    </div>
    <br />
    <div>
      <p2>Response text: {text}</p2>
    </div>
    </>
  )
}

export default App
