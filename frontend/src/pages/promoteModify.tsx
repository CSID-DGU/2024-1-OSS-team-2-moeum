import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { Container,Row, Col, Form, Button} from 'react-bootstrap';
import Header from "pages/header";
import { useRouter } from 'next/router';
import OperatorNav from "pages/operatorNav";
import { useState } from 'react';


const PromoteModify: NextPage = () => {

  const router = useRouter();

  const [content, setContent] = useState<any>(null);

  const handleCancleClick = () => {
    router.push('/promote'); 
  };
  const handleSaveClick = async () => {
    const formData = new FormData();
};

  return <> 
  <Header />

    <Container fluid="md">
      <Row>
        <Col sm={2}>
          <OperatorNav />
        </Col>

        <Col>
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Label>홍보글 작성</Form.Label>
            <Form.Control as="textarea" rows={3}/>
          </Form.Group>
          <Form.Group controlId="formFileSm" className="mb-3">
            <Form.Label>이미지 첨부</Form.Label>
            <Form.Control type="file" size="sm" />
          </Form.Group>
          <Button variant="outline-secondary" onClick = {handleCancleClick}>취소</Button>{' '}
          <Button variant="outline-secondary" onClick = {handleSaveClick}>수정 완료</Button>{' '}
        </Col>
      </Row>
    </Container>
  </>
}

export default PromoteModify