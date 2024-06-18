// pages/userCalendar.tsx

'use client';

import withAuth from 'app/components/withAuth';
import { useAuth } from 'contexts/AuthContext';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useEffect, useState } from 'react';
import 'styles/globals.css';
import { stringify } from 'querystring';
import Header from "pages/header";

const MemberShipUrl = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/membership`;

interface Event {
  title: string;
  start: string;
  end: string;
  color: string;
}
interface BackendEvent{
  user_id:string;
  name: string;
  starts_at:string;
  ends_at:string;
  event_id:string;
}

interface GroupData {
  uuid: string;
  name: string;
}

const UserCalendarPage = () => {
  const { userState } = useAuth();
  const [baseEvents, setBaseEvents] = useState<Event[]>([]);
  const [groupEvents, setGroupEvents] = useState<GroupData[]>([]);

  useEffect(() => {
    if (userState.auth) {
      fetchUserCalendarEvents(); // Load user calendar events on initial load
    }
  }, [userState.auth]);

  const fetchUserCalendarEvents = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/user/calendar?user_id=${userState.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userState.token}`
        }
      });

      const events: BackendEvent[] = await response.json();

      setBaseEvents(events.map(event => ({
        title: event.name,
        start: event.starts_at,
        end: event.ends_at,
        color: '#CED4DA'
      })));
      console.log(`${events}loading ok`)
    } catch (error) {
      console.error('Error loading calendar data:', error);
    }
  };

  const handleEventAdd = async (selectInfo: any) => {
    const title = prompt('Enter the event name:');
    if (title) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/user/calendar`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userState.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            starts_at: selectInfo.startStr,
            ends_at: selectInfo.endStr,
            name: title
          })
        });

        const newEvent = await response.json();
        setBaseEvents(prevEvents => [...prevEvents, {
          title: newEvent.name,
          start: newEvent.starts_at,
          end: newEvent.ends_at,
          color: "#CED4DA"
        }]);
      } catch (error) {
        console.error('Error adding event:', error);
      }
    }
  };

  const fetchGroupAll = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/group/all`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      const groups: GroupData[] = await response.json();
      setGroupEvents(groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleSignUp = async (groupUuid: string) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${userState.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        permission: 'user',
        user_id: userState.id,
        group_uuid: groupUuid
      })
      
    };

    try {
      const response = await fetch(MemberShipUrl, requestOptions);
      console.log(JSON.stringify({
        permission: 'user',
        user_id: userState.id,
        group_uuid: groupUuid
      }));
      if (response.ok) {
        alert('가입 신청이 완료되었습니다!');
      } else {
        const errorData = await response.json();
        alert(`가입 신청에 실패했습니다: ${errorData.detail}`);
      }
    } catch (error) {
      console.error('Error during sign up:', error);
      alert('Failed to sign up. Please try again.');
    }
  };

  const handleEventClick = (info: any) => {
    const { title, start, end } = info.event;
    alert(`Event: ${title}\nStart: ${start.toLocaleString()}\nEnd: ${end ? end.toLocaleString() : 'N/A'}`);
  };

  return ( <>
    <Header />
    <div>
      <div className="headerContainer">
        <h1 className="pageTitle">개인 캘린더</h1>
      </div>
      <div style={{ display: 'flex', height: '100vh' }}>
        <div style={{ flex: 1 }}>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={baseEvents}
            slotMinTime="09:00:00"
            slotMaxTime="22:00:00"
            eventClick={handleEventClick}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            selectable={true}
            select={handleEventAdd}
          />
        </div>
        <div style={{ flex: 1, padding: '10px' }}>
          <button onClick={fetchGroupAll} style={{ marginBottom: '20px', padding: '10px 20px' }}>
            모든 동아리 조회
          </button>
          <div>
            {groupEvents.map((group) => (
              <div key={group.uuid} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
                <span>{group.name}</span>
                <button onClick={() => handleSignUp(group.uuid)} style={{ padding: '5px 10px' }}>
                  Sign Up
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default withAuth(UserCalendarPage);