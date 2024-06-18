'use client';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import withAuth from 'app/components/withAuth';
import { useAuth } from 'contexts/AuthContext';
import Header from "pages/header";
import { stringify } from 'querystring';
import React, { ChangeEvent, useEffect, useState } from 'react';
import 'styles/globals.css';

interface Event {
  title: string;
  start: string;
  end: string;
  color: string;
}

interface Team {
  uuid: string;
  group_uuid: string;
  name: string;
}

interface BackendEvent {
  starts_at: string;
  ends_at: string;
  name: string;
  event_id: string;
  group_uuid: string;
}

interface Group {
  uuid: string;
  name: string;
}
interface AvailableTimeEntry {
  start: string;
  end: string;
}

interface AvailableTime {
  date: string;
  list: AvailableTimeEntry[];
}

interface TeamInfo {
  team_name: string;
  belonging_group_uuid: string;
  sum_second: number;
  available_time: AvailableTime[];
}
interface TeamAvailabilityInfo {
  team_name: string;
  belonging_group_uuid: string;
  sum_second: number;
  available_time: AvailableTime[];
}

// 인덱스 서명을 사용하여 동적 키를 처리
interface ApiResponse {
  [teamUuid: string]: TeamAvailabilityInfo;
}

interface Teams {
  [key: string]: TeamInfo;
}

interface TeamData {
  name: string;
  uuid: string;
  group_uuid: string;
}

const GroupComponent = ({ setGroupUuid }: { setGroupUuid: React.Dispatch<React.SetStateAction<string>> }) => {
  const { userState } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/group`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userState.token}`
          }
        });
        const data: Group[] = await response.json(); // Assuming the response returns an array of groups
        if (data.length > 0) {
          setGroup(data[0]); // Set only the first group object to state
          setGroupUuid(data[0].uuid); // Set the group UUID
        } else {
          console.log("No groups found in response.");
        }
      } catch (error) {
        console.error('Failed to fetch group:', error);
      }
    };

    fetchGroup();
  }, [userState.token, setGroupUuid]);

  return null;
};

const GroupCalendarPage = () => {
  const [baseEvents, setBaseEvents] = useState<Event[]>([]);
  const [groupUuid, setGroupUuid] = useState('');
  const [freeTimesEvents, setFreeTimesEvents] = useState<Event[]>([]);
  const [showFreeCalendar, setShowFreeCalendar] = useState(false);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null); // 선택된 팀 상태 추가
  const [userTeamUuid, setUserTeamUuid] = useState<string | null>(null); // 사용자 팀 UUID 상태 추가

  const { userState } = useAuth(); // 사용자 상태를 가져옵니다.

  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [otherTeams, setOtherTeams] = useState<Team[]>([]);
  const [selectedUserTeamUuid, setSelectedUserTeamUuid] = useState<string>('');

  useEffect(() => {
    if (!groupUuid) return; // UUID가 설정되지 않았다면 실행하지 않음
    const fetchGroupEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/group/calendar?group_uuid=${groupUuid}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userState.token}`
          }
        });
        const data = await response.json();
        const events = data.map((event: any) => ({
          title: event.name,
          start: event.starts_at,
          end: event.ends_at,
          color: "#FFC107"
        }));
        setBaseEvents(events);
      } catch (error) {
        console.error('Failed to fetch group events:', error);
      }
    };
    const fetchUserTeams = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/team?user_id=${userState.id}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userState.token}`
          }
        });
        const teams = await response.json();
        setUserTeams(teams);
        if (teams.length > 0) {
          setUserTeamUuid(teams[0].uuid); // Set the first team UUID as userTeamUuid
          setSelectedUserTeamUuid(teams[0].uuid); // Optionally set the first team as selected by default
        }
      } catch (error) {
        console.error('Failed to fetch user teams:', error);
      }
    };

    fetchGroupEvents();
    fetchUserTeams();
  }, [groupUuid, userState.id, userState.token]);

  useEffect(() => {
    const fetchOtherTeams = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/search?team_uuid=${selectedUserTeamUuid}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${userState.token}`
          }
        });
        const data: ApiResponse = await response.json();
        console.log("team=" + data.team_name);

        // 수정된 로직: Team 인터페이스를 충족하도록 group_uuid 포함
        const fetchedTeams = Object.entries(data).map(([uuid, team]) => ({
          uuid, // 객체의 키를 uuid로 사용
          name: team.team_name,
          group_uuid: team.belonging_group_uuid, // group_uuid를 추가
          availableTime: team.available_time,
          sumSecond: team.sum_second
        }));

        console.log("Fetched Teams:", fetchedTeams);
        setOtherTeams(fetchedTeams);

      } catch (error) {
        console.error('Failed to fetch other teams:', error);
      }
    };

    if (selectedUserTeamUuid) {
      fetchOtherTeams();
    }
  }, [selectedUserTeamUuid, userState.token]);

  const handleUserTeamSelection = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUserTeamUuid(e.target.value);
  };

  const handleTeamClick = async (teamUuid: string, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (teamUuid === userTeamUuid) {
      alert("자신이 속한 팀입니다.");
      return;
    }

    const selected = teams.find(team => team.uuid === teamUuid);
    setSelectedTeam(selected || null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/search?team_uuid=${userTeamUuid}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${userState.token}`
        }
      });
      const data = await response.json();
      let availableTime = data[teamUuid]["available_time"];

      setFreeTimesEvents((prevEvents) => {
        const newEvents = availableTime.flatMap((value: AvailableTime) =>
          value["list"].map((value2: AvailableTimeEntry) => ({
            title: data[teamUuid].team_name + "과의 freeTime",
            start: value2.start,
            end: value2.end,
            color: '#FFC107'
          }))
        );
        return [...newEvents];
      });
      setShowFreeCalendar(true);
    } catch (error) {
      console.error('Failed to fetch team availability:', error);
    }
  };

  const handleCollaborateClick = async (targetTeamUuid: string) => {
    if (!selectedUserTeamUuid) {
      alert("팀을 선택하세요.");
      return;
    }

    if (selectedUserTeamUuid === targetTeamUuid) {
      alert('자신이 속한 팀입니다');
      return;
    }

    try {
      const collaborationData = {
        request_team_uuid: selectedUserTeamUuid,
        response_team_uuid: targetTeamUuid,
        name: `${userTeams.find(team => team.uuid === selectedUserTeamUuid)?.name} Collaboration with ${otherTeams.find(team => team.uuid === targetTeamUuid)?.name}`,
        accepted: false
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/collaboration`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userState.token}`
        },
        body: JSON.stringify(collaborationData)
      });

      if (response.ok) {
        console.log(stringify(collaborationData));
        alert('협업 신청이 완료되었습니다!');
      } else {
        const errorData = await response.json();
        alert(`협업 신청에 실패했습니다: ${errorData.detail}`);
      }
    } catch (error) {
      console.error(`Failed to send collaboration request:`, error);
      alert('협업 신청에 실패했습니다.');
    }
  };

  const handleEventClick = (info: any) => {
    const { title, start, end } = info.event;
    alert(`Event: ${title}\nStart: ${start.toLocaleString()}\nEnd: ${end ? end.toLocaleString() : 'N/A'}`);
  };

  useEffect(() => {
    console.log(freeTimesEvents); // freeTimesEvents 상태가 변경된 후에 로그를 찍습니다.
  }, [freeTimesEvents]);

  return ( <>
    <Header />
    <div>
      <GroupComponent setGroupUuid={setGroupUuid} />
      <div className="headerContainer">
        <h1 className="pageTitle">동아리 캘린더</h1>
        <select onChange={handleUserTeamSelection} value={selectedUserTeamUuid}>
          {userTeams.map(team => (
            <option key={team.uuid} value={team.uuid}>{team.name}</option>
          ))}
        </select>
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
          />
        </div>
        <div style={{ flex: 1, overflowY: 'scroll' }}>
          {otherTeams.map((team) => (
            <div key={team.uuid} onClick={(e) => handleTeamClick(team.uuid, e)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
              <span>
                {team.name}     
              </span>
              <button onClick={() => handleCollaborateClick(team.uuid)} style={{ padding: '5px 10px' }}>
                협업 신청
              </button>
            </div>
          ))}
          {showFreeCalendar && (
            <>
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                events={freeTimesEvents}
                slotMinTime="09:00:00"
                slotMaxTime="22:00:00"
                eventClick={handleEventClick}
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                }}
                height="auto"
              />
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default withAuth(GroupCalendarPage);
