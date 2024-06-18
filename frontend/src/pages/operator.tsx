import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { Container, Row, Col, Nav} from 'react-bootstrap';
import Head from "next/head";
import Header from "pages/header";
import OperatorNav from "pages/operatorNav";
import withAuth from 'app/components/withAuth';
import { useAuth } from 'contexts/AuthContext';


const Operator: NextPage = () => {

  const { userState } = useAuth();
  return <>

  <Header />

  <Container fluid="md">
  <Row>
    <Col sm={2}>
      <OperatorNav />
    </Col>
  </Row>
  </Container>

    </> 
}

export default withAuth(Operator);