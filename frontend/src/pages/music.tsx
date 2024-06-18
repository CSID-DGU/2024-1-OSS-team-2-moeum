import { NextPage } from 'next';
import Head from 'next/head';
import Header from 'pages/header';
import { Container, Button } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from 'contexts/AuthContext';
import styles from '../styles/music.module.css';

const Music: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { userState } = useAuth();

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'audio/wav') {
      setSelectedFile(file);
    } else {
      alert('Please drop a WAV file!');
    }
  };

  // 파일 타입 체크 안하는 버전 - 위 함수 지우고 이거 사용하면 됨 
  // const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   const file = e.dataTransfer.files[0];
  //   if (file) {
  //     setSelectedFile(file);
  //   }
  // };

  const handleCancel = () => {
    setSelectedFile(null);
  };

  const handleConfirm = async () => {
    if (!selectedFile) {
      alert('No file selected!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/sheet/upload`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userState.token}`
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await res.json();
      alert('File uploaded successfully!');
      console.log('File uploaded successfully:', data);

      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const [music, setMusic] = useState([]);

  const fetchMusicTranscriptions = async () => {
    let response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/sheet`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${userState.token}` // JWT 토큰을 헤더에 포함
      }
    });

    let data = await response.json();
    setMusic(data);
  }

  useEffect(() => {
    fetchMusicTranscriptions();
  }, [])

  // React와 함께 사용한다고 가정할 때 MouseEvent 타입을 사용할 수 있습니다.
  const downloadClickHandler = async (e: React.MouseEvent<HTMLDivElement>): Promise<void> => {
    // 이벤트가 발생한 요소의 구조에 따라 타입 캐스팅이 필요할 수 있습니다.
    let uuid = (e.target as HTMLElement).parentNode!.parentNode!.childNodes[0] as HTMLElement;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/sheet/download?transcription_uuid=${uuid.innerText}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/octet-stream', // 실제 내려받을 파일의 MIME 타입에 맞게 수정
          'Authorization': `Bearer ${userState.token}`
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const blob = await response.blob();
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition ? contentDisposition.split('filename=')[1].replace(/"/g, '') : 'default_filename.mid';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };




  return (
    <>
      <Head>
        <title>Music Page</title>
      </Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <Header />
      <Container style={{ marginTop: '20px' }}>
        <div
          style={dropzoneStyles}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleDrop}
        >
          {selectedFile ? (
            <p>Selected file: {selectedFile.name}</p>
          ) : (
            <p>채보하고 싶은 WAV 파일을 드롭다운 하세요.</p>
          )}
        </div>
        <Button variant="secondary" onClick={handleCancel} style={{ marginRight: '10px' }}>
          취소
        </Button>
        <Button variant="secondary" onClick={handleConfirm}>
          확인
        </Button>
      </Container>
      <Container>
        <div className={styles.box}>
          {Array.isArray(music) && music.map((v: any) => <div key={v.uuid} className={styles.inner}>
            <div className={styles.uuid}>
              {v.uuid}
            </div>
            <div>
              {v.music_file_path && <div className={styles.download_link} onClick={downloadClickHandler}>
                {v.music_file_path}
              </div>}
              {!v.music_file_path && <div>
                악보로 변환 중입니다.
              </div>}
            </div>
          </div>
          )}
        </div>
      </Container>
    </>
  );
};

const dropzoneStyles: React.CSSProperties = {
  border: '2px dashed #cccccc',
  borderRadius: '4px',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
  marginBottom: '20px',
  height: '200px',
};

export default Music;
