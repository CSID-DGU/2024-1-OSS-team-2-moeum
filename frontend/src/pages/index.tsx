import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { Container,Row,Col, Button, Spinner} from 'react-bootstrap';
import Head from "next/head";
import Header from "pages/header";
import { useRouter } from 'next/router';


const Home: NextPage = () => {

  const router = useRouter();
  const handleBoardListPage = () => {
    router.push('/boardList'); 
  };
  const handleOperatorPage = () => {
    router.push('/operator'); 
  };
  const handleMusicPage = () => {
    router.push('/music'); 
  };
  const handleUserCalendarPage = () => {
    router.push('/userCalendar'); 
  };
  const handleGroupCalendarPage = () => {
    router.push('/groupCalendar'); 
  };
  const handleSigninPage = () => {
    router.push('/signin'); 
  };
  
  return <>
      <Head>
        <title>모임음악, 모음</title>
      </Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <Header />
      <Container fluid style={{ backgroundImage: "url('/image/gray.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', padding: '50px 0' }}>
      <Row>
       <Col xs={1}>
     </Col>
     <Col><br/><br/>
     <h1 style={{ fontFamily: 'Roboto', fontSize: '60px'}}>모음</h1>
     </Col>
     </Row>
        <Row>
       <Col xs={1}>
     </Col>
     <Col><br/><br/>
     음악 동아리를 위한 플랫폼 <br/>
     모임 음악, 모음 
     <br/>
     <br/>
     <br/>
     <br/>
     <br/>
     </Col>
     </Row>
     </Container>
     <br /><br />
     <Container>
        <Row className="justify-content-center mb-4">
          <Col xs="auto">
            <Button variant="outline-dark" size="lg" onClick={handleUserCalendarPage}>
              개인 캘린더<br /><br />
              <img src="/image/user_calendar/weekly-calendar 128px.png" /><br /><br />
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-dark" size="lg" onClick={handleGroupCalendarPage}>
              동아리 캘린더<br /><br />
              <img src="/image/group_calendar/wepik--128px.png" /><br /><br />
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-dark" size="lg" onClick={handleBoardListPage}>
              게시판<br /><br />
              <img src="/image/board/board 256px.png" style={{ width: '128px', height: '128px' }}/><br /><br />
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-dark" size="lg" onClick={handleMusicPage}>
              악보 채보<br /><br />
              <img src="/image/music/musical-notes 128px.png" /><br /><br />
            </Button>
          </Col>
          <Col xs="auto">
            <Button variant="outline-dark" size="lg" onClick={handleOperatorPage}>
              운영진<br /><br />
              <img src="/image/op/user 128px.png" /><br /><br />
            </Button>
          </Col>
        </Row>
      </Container>

  </>
  
}

export default Home