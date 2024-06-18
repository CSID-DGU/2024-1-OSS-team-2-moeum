import withAuth from 'app/components/withAuth';
import { useAuth } from 'contexts/AuthContext';
import { useRouter } from 'next/router';
import Header from "pages/header";
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';

interface FormData {
    user_id: string;
    role: string;
    group_uuid?: string;
}

// New interface for group members
interface GroupMember {
    id: string;
    username: string;
}

const TeamRequest = () => {
    const router = useRouter();
    const { userState } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        user_id: "",
        role: "",
        group_uuid: undefined,
    });
    const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);  // Use GroupMember interface here
    useEffect(() => {
        // Fetch group UUID on component mount
        const fetchGroupUUID = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/group`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${userState.token}`,
                    },
                });

                const groupData = await response.json();
                if (response.ok) {
                    setFormData({ ...formData, group_uuid: groupData[0].uuid });
                } else {
                    throw new Error('Failed to fetch group UUID');
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchGroupUUID();
    }, []);
    useEffect(() => {
        const fetchGroupMembers = async () => {
            if (formData.group_uuid) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/group/member?group_uuid=${formData.group_uuid}`, {
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': `Bearer ${userState.token}`
                        },
                    });
                    const data: GroupMember[] = await response.json();  // Use GroupMember interface for typing response
                    console.log(data);
                    if (response.ok) {
                        setGroupMembers(data);
                    } else {
                        console.error('Failed to fetch group members');
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        };

        fetchGroupMembers();
    }, [formData.group_uuid, userState.token]);
    
    const formHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Split user input and trim spaces
        const inputUserIds = formData.user_id.split(',').map(id => id.trim());

        // Check if all input IDs are in the group members list
        const allMembersValid = inputUserIds.every(id => groupMembers.some(member => member.id === id));

        if (!allMembersValid) {
            const invalidMembers = inputUserIds.filter(id => !groupMembers.some(member => member.id === id));
            alert(`같은 그룹의 멤버가 아닙니다: ${invalidMembers.join(', ')}`);
            return;
        }

        try {
            const teamResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/team`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    group_uuid: formData.group_uuid,
                    name: formData.role,
                }),
            });

            const teamData = await teamResponse.json();
            if (!teamResponse.ok) {
                throw new Error('Failed to create team');
            }

            // Add each user to the team
            for (const userId of inputUserIds) {
                await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/teamming`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${userState.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id: userId,
                        team_uuid: teamData.uuid,
                        role: "string", // Assuming role needs to be set; adjust as necessary
                    }),
                });
            }

            router.replace('/');
        } catch ( error) {
            console.error(error);
            alert("There was a problem processing your team request.");
        }
    };

    return (
        <>
        <Header />
        <Container fluid>
            <Row>
                <Col md={6} lg={4} className="p-4">
                    <h1 className="text-center mb-4">팀 신청</h1>
                    <Form onSubmit={handleFormSubmit}>
                        <Form.Group controlId="formUserId" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="회원 아이디를 입력하세요. 아이디는 쉼표로 구분"
                                name="user_id"
                                onChange={formHandler}
                                style={{ padding: '10px' }}
                            />
                        </Form.Group>
                        <Form.Group controlId="formTeamname" className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="팀 명을 입력하세요"
                                name="role"
                                onChange={formHandler}
                                style={{ padding: '10px' }}
                            />
                        </Form.Group>
                        <Form.Group className="text-center">
                            <Button type="submit" className="w-100" variant="outline-dark" style={{ boxShadow: 'inset 0 0 0 1px var(--gray-dark-2)', padding: '10px'}}>
                                신청
                            </Button>
                        </Form.Group>
                    </Form>
                </Col>
            </Row>
        </Container>
    </>
);
};


export default withAuth(TeamRequest);
