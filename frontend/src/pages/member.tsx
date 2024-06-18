import type { NextPage } from 'next'
import { Container, Row, Col, Table, Button} from 'react-bootstrap';
import Header from 'pages/header';
import { useEffect, useState } from 'react';
import OperatorNav from "pages/operatorNav";
import { useGroup } from 'contexts/GroupContext';

interface User {
  id: string;
  username: string;
}

const Member: NextPage = () => {
  const { selectedGroup } = useGroup();
  const [members, setMembers] = useState<User[]>([]);

  const fetchGroupMembers = async (groupUUID: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/group/member?group_uuid=${groupUUID}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoic3RyaW5nIiwiZXhwaXJlcyI6MTcxNjYzNzY1Ni4yNjMxMjU0fQ.c8hnM4NhTzRD7iyiEpsTDm02ahiJLWgoH-4aC2KXUD0'
        }
      }
      );
      const data = await response.json();
      console.log("success");
      setMembers(data);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupMembers(selectedGroup.uuid);
    }
  }, [selectedGroup]);


  return <> 
      <Header /> <br />
      <Container fluid="md">
      <Row>
        <Col sm={2}>
          <OperatorNav />
        </Col>
        <Col sm ={8}>
          <h1>회원 목록</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ width: '50%' }}>아이디</th>
                <th style={{ width: '50%' }}>이름</th>
              </tr>
            </thead>
            <tbody>
              {members.map((user) => (
                <tr key={user.id} style={{ cursor: 'pointer' }}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
      </Container>
    </>
}

export default Member