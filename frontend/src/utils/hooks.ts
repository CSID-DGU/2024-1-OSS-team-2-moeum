import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from 'contexts/AuthContext'; // useAuthContext 대신 useAuth를 사용

export const useAuthGuard = (): void => {
  const router = useRouter();
  const { userState } = useAuth(); // useAuth 훅 사용

  useEffect(() => {
    // 사용자를 얻을 수 없을 때는 로그인 페이지로 리다이렉트
    if (!userState.auth && !userState.isLoading) {
      const currentPath = router.pathname;

      router.push({
        pathname: '/signin',
        query: {
          redirect_to: currentPath,
        },
      });
    }
  }, [router, userState]);
};
