import React, { createContext, useContext, useState, FC, ReactNode } from 'react';

interface Group {
  uuid: string;
  name: string;
}

interface GroupContextType {
  selectedGroup: Group | null;
  selectGroup: (group: Group) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroup = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup must be used within a GroupProvider');
  }
  return context;
};

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: FC<GroupProviderProps> = ({ children }) => {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);
  };

  return (
    <GroupContext.Provider value={{ selectedGroup, selectGroup }}>
      {children}
    </GroupContext.Provider>
  );
};
