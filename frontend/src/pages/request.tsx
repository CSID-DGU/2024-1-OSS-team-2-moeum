import type { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { Container, Row, Col, Table, Modal, Button} from 'react-bootstrap';
import Header from "pages/header";
import OperatorNav from "pages/operatorNav";
import { useEffect, useState } from 'react';
import { useGroup } from 'contexts/GroupContext';
import { useAuth } from 'contexts/AuthContext';

interface CollaboRequest {
  request_team_uuid: string;
  response_team_uuid: string;
  name: string
  accepted: boolean;
  group_uuid_1: string;
  group_uuid_2: string;
}

interface Team {
  uuid: string;
  name: string;
  group_uuid: string;
}

interface CollaboAccept {
  request_team_uuid: string;
  response_team_uuid: string;
  accepted: boolean;
}

const Request: NextPage = () => {

  const { selectedGroup } = useGroup();
  const [collaboRequests, setCollaboRequests] = useState<CollaboRequest[]>([]);
  const { userState } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/team`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };


  const fetchCollaboRequest = async (groupUUID: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/collaboration?user_id=${groupUUID}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userState.token}`
        }
      }
      );
      const data = await response.json();
      console.log(data);
      console.log("success");
      setCollaboRequests(data);
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  useEffect(() => {
    if (userState.auth) {
      //fetchTeamRequest(selectedGroup.uuid);
      fetchCollaboRequest(userState.id);
    }
  }, [userState.id]);

  useEffect(() => {
    fetchTeams();
  }, []);


  const getTeamNameById = (teamId: string) => {
    const team = teams.find(team => team.uuid === teamId);
    return team ? team.name : 'Unknown';
  };


  const handleAcceptCollabo = async (request_team_uuid: string, response_team_uuid: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/collaboration/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userState.token}`,
          },
          body: JSON.stringify({ request_team_uuid, response_team_uuid, accepted: true }),
        }
      );

      if (response.ok) {
        setCollaboRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.request_team_uuid === request_team_uuid && req.response_team_uuid === response_team_uuid ? { ...req, accepted: true } : req
          )
        );
      } else {
        const errorText = await response.text();
        console.error('Error accepting collaboration request:', errorText);
      }
    } catch (error) {
      console.error('Error accepting collaboration request:', error);
    }
  };

  const handleRejectCollabo = (name: string) => {
    //setReqCollaboList(reqCollaboList.filter(reqCollabo => reqCollabo.id !== id));
  };


  return <>
  <Header />  
      <br />
      <Container fluid="md">
      <Row>
        <Col sm={2}>
            <OperatorNav />
        </Col>

        <Col>
        <h1>협업 요청 목록</h1>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>요청한 팀</th>
                <th>요청 받은 팀</th>
                <th>협업 이름</th>
              </tr>
            </thead>
            <tbody>
              {collaboRequests
            .filter(req => !req.accepted) // accepted가 false인 경우에만 출력
            .filter(req => selectedGroup === null || req.group_uuid_1 === selectedGroup.uuid || req.group_uuid_2 === selectedGroup.uuid)
            .map(req => (
              <tr key={`${req.request_team_uuid}-${req.response_team_uuid}`} style={{ cursor: 'pointer' }}>
                <td>{getTeamNameById(req.request_team_uuid)}</td>
                <td>{getTeamNameById(req.response_team_uuid)}</td>
                <td>{req.name}</td>
                <td>
                  <Button
                    variant="secondary"
                    onClick={() => handleAcceptCollabo(req.request_team_uuid, req.response_team_uuid)}
                  >
                    수락
                  </Button>{' '}
                  <Button
                    variant="secondary"
                    onClick={() => handleRejectCollabo(req.name)}
                  >
                    거절
                  </Button>
                </td>
              </tr>
            ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>


  </>
  
}

export default Request