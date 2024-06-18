import type { NextPage } from 'next'
import { Nav } from 'react-bootstrap';
import { useRouter } from 'next/router';


const OperatorNav: NextPage = () => {
    const router = useRouter();

    const handleMemberPage = () => {
        router.push('/member'); 
    };

    const handleRequestPage = () => {
        router.push('/request'); 
    };

    const handlePromotePage = () => {
        router.push('/promote'); 
    };

    const handleOperatorPage = () => {
        router.push('/operator'); 
    };

    return <>
        <Nav defaultActiveKey="/home" className="flex-column">
        <Nav.Link eventKey="disabled" disabled></Nav.Link>
        <Nav.Link onClick={handleOperatorPage} className="text-muted">운영진</Nav.Link>
        <Nav.Link onClick={handleRequestPage} className="text-muted"> 협업 요청 관리</Nav.Link>
        <Nav.Link onClick={handleMemberPage} className="text-muted"> 회원 관리</Nav.Link>
        <Nav.Link onClick={handlePromotePage} className="text-muted"> 동아리 홍보 관리</Nav.Link>
        <Nav.Link eventKey="disabled" disabled></Nav.Link>
        </Nav>

    </> 
}

export default OperatorNav