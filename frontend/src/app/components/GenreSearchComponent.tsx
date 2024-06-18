import React, { useState } from 'react';

interface TeamData {
  team: string;
  genre: string;
  start: string;
  end: string;
}

interface GenreSearchComponentProps {
  onGenreSelect: (selectedTeams: TeamData[]) => Promise<void>;
}

const GenreSearchComponent = ({ onGenreSelect }: GenreSearchComponentProps) => {
  const [genre, setGenre] = useState(''); // 검색할 장르를 저장하는 상태
  const [teams, setTeams] = useState<TeamData[]>([]); // API로부터 받은 팀 데이터를 저장하는 상태

  const searchTeams = async (genre: string) => {
    try {
      const response = await fetch(`/api/search?genre=${encodeURIComponent(genre)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setTeams(data); // 받은 데이터를 teams 상태에 저장
      console.log('Teams loaded:', data); // 로드된 팀 데이터 로깅
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGenre(event.target.value);
  };

  const handleSearchClick = async () => {
    await searchTeams(genre);
  };

  const handleTeamSelect = async (team: TeamData) => {
    console.log('Team selected:', team); // 선택된 팀 로깅
    await onGenreSelect([team]); // 선택된 팀을 onGenreSelect를 통해 전달
  };

  return (
    <div>
      <input
        type="text"
        placeholder="장르로 검색하기"
        value={genre}
        onChange={handleInputChange}
      />
      <button onClick={handleSearchClick}>검색</button>
      {teams.length > 0 && (
        <ul style={{ padding: 0 }}>
          {teams.map((team, index) => (
            <li key={index}> {/* key를 여기에 추가합니다. */}
              <button onClick={() => handleTeamSelect(team)} style={{ padding: '8px', margin: '5px', width: '90%' }}>
                {team.team} - {team.genre}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GenreSearchComponent;
