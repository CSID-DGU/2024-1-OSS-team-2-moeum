'use client'

import styles from 'styles/page.module.css'
import Link from 'next/link'
import { useState, ChangeEvent, FormEvent } from 'react';
import { useAuth } from 'contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface FormData {
    username: string;
    password: string;
}

export default function SignIn() {
    const router = useRouter();
    const { userState, setUserState } = useAuth();

    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: "",
    });

    const formHandler = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((formData) => ({
            ...formData,
            [e.target.name]: e.target.value,
        }));
    };

    const formSubmitHandler = async (e: FormEvent) => {
        e.preventDefault();

        const fetchUser = async () => {
            let queryParams = new URLSearchParams(formData as any).toString();
            let fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/user/signin`;
            
            try {
                let res = await fetch(fetchURL, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: queryParams,
                });

                if (!res.ok) {
                    let errorData = await res.json();
                    alert(errorData.detail || "로그인에 실패했습니다. 다시 시도해 주세요.");
                    return;
                }

                let data = await res.json();

                setUserState({
                    ...userState,
                    token: data.access_token,
                    id: data.user_id,
                    auth: true,
                });

                router.replace('/');
            } catch (error) {
                console.error(error);
                alert("로그인 중 문제가 발생했습니다. 다시 시도해 주세요.");
            }
        };
        fetchUser();
    };

    return (
        <section className={styles.section}>
            <div className={styles.section_mid}>
                <div className={styles.title}>
                    모임 음악, 모음
                </div>
                <div className={styles.form_wrap}>
                    <form onSubmit={formSubmitHandler}>
                        <div className={styles.id_area}>
                            <input type='text' onChange={formHandler} name='username' placeholder="아이디" />
                        </div>
                        <div className={styles.pw_area}>
                            <input type='password' onChange={formHandler} name='password' placeholder='비밀번호' />
                        </div>
                        <div className={styles.btn_area}>
                            <button type="submit" className={styles.login_btn}>로그인</button>
                        </div>
                        <div className={styles.guide}>
                            <span className={styles.guide_1}>회원이 아니신가요?</span>
                            <Link href="/signup">
                                <span className={styles.guide_2}>회원가입</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
