import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Card, Row, Col } from 'react-bootstrap';
import Head from 'next/head';
import Header from 'pages/header';

interface Post {
  id: number;
  title: string;
  date: string;
  author: string;
  content: string;
}

const Post: NextPage = () => {
  const router = useRouter();
  const { postId } = router.query;
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => { 
    const fetchPost = async () => {
      // API 호출
      // 임시 데이터 사용
      const dummyPost: Post = {
        id: 1,
        title: '베이스 기타 추천해주세요',
        date: '2024-05-12',
        author: '소희',
        content: '베이스 기타 추천해주세요.',
      };
      setPost(dummyPost);
    };

    if (1) { 
      fetchPost();
    }
  }, [postId]);

  return (
    <>
      <Head>
        <title>Board</title>
      </Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <Header />
      <Container style={{ marginTop: '20px' }}>
        {post ? (
          <div className="d-flex justify-content-around">
          <Card style={{ width: '50rem' }}>
            <Card.Body>
              <Card.Title>{post.title}</Card.Title>
              <hr />
              <Card.Text>
              <Container fluid = "md">
                <Row>
                  <Col> <p>작성 날짜: {post.date}</p> </Col>
                  <Col> <p>작성자: {post.author}</p> </Col>
                </Row> <br/>
                <Row> {post.content}</Row>
              </Container>
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
        ) : (
          <p>게시글을 불러오는 중...</p>
        )}
      </Container>
    </>
  );
};

export default Post;
