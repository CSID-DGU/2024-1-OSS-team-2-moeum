import { NextPage } from 'next';
import Head from 'next/head';
import Header from 'pages/header';
import { Container, Table, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import withAuth from 'app/components/withAuth';

// 임시 데이터
const dummyPosts = [
  { id: 1, title: '베이스 기타 추천해주세요', date: '2024-05-12', author: '소희' },
  { id: 2, title: '노래 추천해주세요', date: '2024-05-11', author: '해솔' },
  { id: 3, title: '질문있어요', date: '2024-05-11', author: '다훈' },
  { id: 4, title: '선택해주세요', date: '2024-05-11', author: '승원' },
];

const BoardList: NextPage = () => {
  const router = useRouter();

  const handleRowClick = (postId: number) => {
    router.push('/post');
  };
  const handleNewPostClick = () => {
    router.push('/newPost'); // 새로운 게시물 작성 페이지로 이동
  };

  return (
    <>
      <Head>
        <title>Board List</title>
      </Head>
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <Header />
      <Container style={{ marginTop: '20px' }}>
        <h1>글 목록</h1>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>제목</th>
              <th>작성 날짜</th>
              <th>작성자</th>
            </tr>
          </thead>
          <tbody>
            {dummyPosts.map((post) => (
              <tr key={post.id} onClick={() => handleRowClick(post.id)} style={{ cursor: 'pointer' }}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.date}</td>
                <td>{post.author}</td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Button variant="outline-secondary" onClick={handleNewPostClick}>게시물 작성</Button>
      </Container>
    </>
  );
};

export default withAuth(BoardList);
