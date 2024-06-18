import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { useRouter } from 'next/router';
import { Container, Form, Image, Nav, Navbar, Button, Spinner} from 'react-bootstrap';
import Header from "pages/header";


const NewPost: NextPage = () => {
  const router = useRouter();

  const handleCancleClick = () => {
    router.push('/boardList'); 
  };

  const handleSaveClick = () => {

  }

  
  return <>
  <Header />
  <Container>
  <Form.Group className="mb-3">
    <Form.Label>제목</Form.Label>
    <Form.Control type="text" placeholder="제목을 입력하세요" />
  </Form.Group>
  <Form.Group className="mb-3">
        <Form.Label>글 작성</Form.Label>
        <Form.Control as="textarea" rows={3} />
      </Form.Group>
      <Button variant="outline-secondary" onClick={handleCancleClick}>취소</Button>{' '}
      <Button variant="outline-secondary" onClick={handleSaveClick}>작성 완료</Button>{' '}
  </Container>
  </>
  
}

export default NewPost