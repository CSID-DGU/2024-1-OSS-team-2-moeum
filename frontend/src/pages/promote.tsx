import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import Link from 'next/link'
import { Container, Row, Col, Placeholder, Card, Nav, Navbar, Button} from 'react-bootstrap';
import Header from "pages/header";
import { useState, useEffect } from 'react';
import OperatorNav from "pages/operatorNav";


const Promote: NextPage = () => {

    const [promote, setPromote] = useState<any>(null); 

    return <>
    <Header /> <br />
    <Container fluid="md">
    <Row>
        <Col sm={2}>
            <OperatorNav />
        </Col>

        <Col> <div className="d-flex justify-content-around">
        <Card style={{ width: '50rem' }}>
            {promote && ( 
            <>
            <Card.Body>
                <Card.Title>{promote.title}</Card.Title>
                <Card.Img variant="top" src={`${promote.thumbnail}`} />
                <Card.Text>
                    {promote.description}
                </Card.Text>
            </Card.Body>
            </>
            )}
        </Card> <br /><br /><br /><br />
        <Link href="/promoteModify">
            <Button variant="secondary">수정</Button>
        </Link>
        </div> </Col>
    </Row>
    </Container>

    </>
}

export default Promote