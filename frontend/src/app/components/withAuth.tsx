// components/withAuth.tsx

import { useAuth } from 'contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const withAuth = (WrappedComponent: React.FC) => {
  const Wrapper: React.FC = (props) => {
    const { userState } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!userState.auth) {
        router.replace('/signin');
      }
    }, [userState.auth, router]);

    if (!userState.auth) {
      return null; // 혹은 로딩 스피너를 표시할 수 있습니다.
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAuth;
