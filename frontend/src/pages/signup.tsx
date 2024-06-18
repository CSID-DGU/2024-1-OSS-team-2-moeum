// pages/signup.tsx

'use client'

import styles from 'styles/page.module.css'
import Link from 'next/link'
import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
    id: string;
    username: string;
    password: string;
}

export default function SignUp() {
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        id: "",
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
            let fetchURL = `${process.env.NEXT_PUBLIC_BACKEND_HOST}/api/user/signup`;

            try {
                let res = await fetch(fetchURL, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData),
                });
                let data = await res.json();

                if (data.msg === "success") {
                    router.replace('/signin');
                } else {
                    console.error("Sign up failed");
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchUser();
    };

    return (
        <section className={styles.section}>
            <div className={styles.section_mid}>
                <div className={styles.title}>
                    회원가입
                </div>
                <div className={styles.form_wrap}>
                    <form onSubmit={formSubmitHandler}>
                        <div className={styles.username_area}>
                            <input type='text' onChange={formHandler} name='username' placeholder="이름" />
                        </div>
                        <div className={styles.id_area}>
                            <input type='text' onChange={formHandler} name='id' placeholder="아이디" />
                        </div>
                        <div className={styles.pw_area}>
                            <input type='password' onChange={formHandler} name='password' placeholder='비밀번호' />
                        </div>
                        <div className={styles.btn_area}>
                            <button type="submit" className={styles.signup_btn}>회원가입</button>
                        </div>
                        <div className={styles.guide}>
                            <span className={styles.guide_1}>이미 회원이신가요?</span>
                            <Link href="/signin">
                                <span className={styles.guide_2}>로그인</span>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}
