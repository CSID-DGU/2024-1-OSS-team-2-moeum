import 'bootstrap/dist/css/bootstrap.min.css';
import type { AppProps } from "next/app";
import {createGlobalStyle } from 'styled-components'
import Head from 'next/head';
import { GroupProvider } from 'contexts/GroupContext';
import '../styles/font.css';
import { AuthProvider } from 'contexts/AuthContext'

const GlobalStyle = createGlobalStyle`
html,
body,
textarea {
  padding: 0;
    margin;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
}
*{
  box-sizing: border-box;
}
a{
  cursor: pointer;
  text-decoration: none;
  transition: .25s;
  color: #000;
}

ol, ul {
  list-style: none;
}
`

const MyApp = ({Component, pageProps }: AppProps) => {
  return (
    <>
    <Head>
      <meta key = "charset" name="charset" content="utf-8" />
      <meta
      key = "viewport"
      name = "viewport"
      content="width=device-width, initial-scale=1, shrink-to-fit=no, maximum-scale=5"
      />
      <meta property = "og: locale" content = "ko_KR" />
      <meta property = "og: type" content = "website" />
    </Head>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <GlobalStyle />
    <AuthProvider>
    <GroupProvider>
      <Component {...pageProps} />
    </GroupProvider>
    </AuthProvider>
    </>
  )
}

export default MyApp
